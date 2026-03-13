import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: 'Full name of the user signing up.',
    type: String,
  })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({
    description: 'Role selected for the user profile.',
    enum: Role,
  })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional({
    description: 'Email address used for signup.',
    type: String,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number used for signup in E.164 format.',
    type: String,
    example: '+491234567890',
  })
  @IsOptional()
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'phoneNumber must be in E.164 format',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Password for Firebase account creation.',
    type: String,
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
