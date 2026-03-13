import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserEntity } from '../../users/entities/user.entity';

export class AuthFirebaseUserEntity {
  @ApiProperty({ description: 'Firebase Authentication UID of the user.' })
  @IsString()
  @IsNotEmpty()
  uid!: string;

  @ApiProperty({
    description: 'Email returned by Firebase when available.',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Phone number returned by Firebase when available.',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Display name returned by Firebase when available.',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Firebase sign-in provider used by the client.',
    required: false,
  })
  @IsOptional()
  @IsString()
  signInProvider?: string;
}

export class AuthSignupEntity {
  @ApiProperty({ description: 'Whether the signup completed successfully.' })
  @IsBoolean()
  success!: boolean;

  @ApiProperty({
    description: 'Created backend user profile.',
    type: UserEntity,
  })
  user!: UserEntity;
}

export class AuthMeEntity {
  @ApiProperty({
    description:
      'Whether the authenticated Firebase user already has a synced backend profile.',
  })
  @IsBoolean()
  isSynced!: boolean;

  @ApiProperty({
    description: 'Firebase-authenticated user information.',
    type: AuthFirebaseUserEntity,
  })
  firebaseUser!: AuthFirebaseUserEntity;

  @ApiProperty({
    description: 'Backend user profile when synced, otherwise null.',
    type: UserEntity,
    required: false,
    nullable: true,
  })
  user!: UserEntity | null;
}

export class AuthSyncProfileEntity {
  @ApiProperty({
    description:
      'Whether backend profile synchronization completed successfully.',
  })
  @IsBoolean()
  success!: boolean;

  @ApiProperty({
    description: 'Synced backend user profile.',
    type: UserEntity,
  })
  user!: UserEntity;
}
