import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as admin from 'firebase-admin';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { ALLOW_UNSYNCED_AUTH_KEY } from '../decorators/allow-unsynced-auth.decorator';
import { AuthContext } from '../decorators/current-auth.decorator';
import { FIREBASE_ADMIN } from './firebase-admin.provider';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(FIREBASE_ADMIN) private readonly firebaseApp: admin.app.App,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      auth: AuthContext;
      user?: UserEntity | null;
    }>();

    const token = this.extractBearerToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException(
        'Missing or malformed Authorization header',
      );
    }

    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await this.firebaseApp.auth().verifyIdToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired Firebase ID token');
    }

    const dbUser = await this.usersService.findByFirebaseUid(decoded.uid);
    const allowUnsynced = this.reflector.getAllAndOverride<boolean>(
      ALLOW_UNSYNCED_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!dbUser && !allowUnsynced) {
      throw new UnauthorizedException(
        'User profile not found in the backend. Please complete signup first.',
      );
    }

    request.auth = {
      firebaseUser: {
        uid: decoded.uid,
        email: decoded.email,
        phoneNumber: decoded.phone_number,
        name: typeof decoded.name === 'string' ? decoded.name : undefined,
        signInProvider:
          typeof decoded.firebase?.sign_in_provider === 'string'
            ? decoded.firebase.sign_in_provider
            : undefined,
      },
      user: dbUser,
    };
    request.user = dbUser;

    return true;
  }

  private extractBearerToken(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.slice(7).trim() || null;
  }
}
