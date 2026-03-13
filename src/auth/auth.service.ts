import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UsersService } from '../users/users.service';
import {
  AuthMeEntity,
  AuthSignupEntity,
  AuthSyncProfileEntity,
} from './entities/auth.entity';
import { normalizeEmail, normalizePhoneNumber } from '../utils/helpers';
import { AuthContext } from './decorators/current-auth.decorator';
import { SyncProfileDto } from './dto/sync-profile.dto';
import { SignupDto } from './dto/signup.dto';
import { FIREBASE_ADMIN } from './firebase/firebase-admin.provider';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(FIREBASE_ADMIN) private readonly firebaseApp: admin.app.App,
    private readonly usersService: UsersService,
  ) {}

  private createAuthSuccessResponse(user: UserEntity): AuthSignupEntity {
    return {
      success: true,
      user,
    };
  }

  private createSyncSuccessResponse(user: UserEntity): AuthSyncProfileEntity {
    return {
      success: true,
      user,
    };
  }

  private buildUserSyncInput(params: {
    firebaseUid: string;
    fullName: string;
    role: UserEntity['role'];
    email?: string;
    phoneNumber?: string;
  }) {
    return {
      firebaseUid: params.firebaseUid,
      fullName: params.fullName,
      role: params.role,
      email: params.email,
      phoneNumber: params.phoneNumber,
    };
  }

  async signup(dto: SignupDto): Promise<AuthSignupEntity> {
    this.validateSignupIdentity(dto.email, dto.phoneNumber);

    let firebaseUser: admin.auth.UserRecord;
    try {
      firebaseUser = await this.firebaseApp.auth().createUser({
        email: dto.email ? normalizeEmail(dto.email) : undefined,
        phoneNumber: dto.phoneNumber
          ? normalizePhoneNumber(dto.phoneNumber)
          : undefined,
        password: dto.password,
        displayName: dto.fullName,
      });
    } catch (error: unknown) {
      throw this.mapFirebaseCreateError(error);
    }

    try {
      const user = await this.usersService.createFromAuth(
        this.buildUserSyncInput({
          firebaseUid: firebaseUser.uid,
          fullName: dto.fullName,
          role: dto.role,
          email: dto.email ?? firebaseUser.email ?? undefined,
          phoneNumber: dto.phoneNumber ?? firebaseUser.phoneNumber ?? undefined,
        }),
      );

      return this.createAuthSuccessResponse(user);
    } catch (error: unknown) {
      this.logger.error(
        `Database user creation failed for Firebase uid=${firebaseUser.uid}`,
        error,
      );

      try {
        await this.firebaseApp.auth().deleteUser(firebaseUser.uid);
      } catch (rollbackError: unknown) {
        this.logger.error(
          `Failed to rollback Firebase user uid=${firebaseUser.uid}`,
          rollbackError,
        );
      }

      throw this.mapDatabaseCreateError(error);
    }
  }

  me(auth: AuthContext): AuthMeEntity {
    return {
      isSynced: Boolean(auth.user),
      firebaseUser: auth.firebaseUser,
      user: auth.user,
    };
  }

  async syncProfile(
    auth: AuthContext,
    dto: SyncProfileDto,
  ): Promise<AuthSyncProfileEntity> {
    if (auth.user) {
      return this.createSyncSuccessResponse(auth.user);
    }

    const email = dto.email ?? auth.firebaseUser.email;
    const phoneNumber = dto.phoneNumber ?? auth.firebaseUser.phoneNumber;

    if (!email && !phoneNumber) {
      throw new BadRequestException(
        'An email or phone number is required to sync the user profile.',
      );
    }

    try {
      const user = await this.usersService.createFromAuth(
        this.buildUserSyncInput({
          firebaseUid: auth.firebaseUser.uid,
          fullName: dto.fullName,
          role: dto.role,
          email,
          phoneNumber,
        }),
      );

      return this.createSyncSuccessResponse(user);
    } catch (error: unknown) {
      throw this.mapDatabaseCreateError(error);
    }
  }

  private validateSignupIdentity(
    email: string | undefined,
    phoneNumber: string | undefined,
  ): void {
    if ((email && phoneNumber) || (!email && !phoneNumber)) {
      throw new BadRequestException(
        'Signup requires exactly one identity: email or phone number.',
      );
    }
  }

  private mapFirebaseCreateError(error: unknown): Error {
    const firebaseError = error as { code?: string; message?: string };

    switch (firebaseError.code) {
      case 'auth/email-already-exists':
        return new ConflictException(
          'An account with this email already exists.',
        );
      case 'auth/phone-number-already-exists':
        return new ConflictException(
          'An account with this phone number already exists.',
        );
      case 'auth/invalid-phone-number':
        return new BadRequestException(
          'The phone number must be in valid E.164 format.',
        );
      case 'auth/invalid-password':
      case 'auth/weak-password':
        return new BadRequestException(
          firebaseError.message ?? 'The password does not meet requirements.',
        );
      default:
        this.logger.error('Firebase user creation failed', firebaseError);
        return new InternalServerErrorException(
          firebaseError.message ?? 'Failed to create Firebase user.',
        );
    }
  }

  private mapDatabaseCreateError(error: unknown): Error {
    const prismaError = error as {
      code?: string;
      meta?: { target?: string[] };
    };

    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target ?? [];

      if (target.includes('email')) {
        return new ConflictException(
          'An account with this email already exists.',
        );
      }

      if (target.includes('phone_number') || target.includes('phoneNumber')) {
        return new ConflictException(
          'An account with this phone number already exists.',
        );
      }

      if (target.includes('firebase_uid') || target.includes('firebaseUid')) {
        return new ConflictException(
          'This Firebase account is already linked to a profile.',
        );
      }
    }

    return new InternalServerErrorException(
      'Failed to sync the user profile with the backend.',
    );
  }
}
