import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Firebase Authentication UID linked to the user.',
    type: String,
  })
  @IsString()
  @MinLength(3)
  firebaseUid!: string;

  @ApiPropertyOptional({
    description: 'Application role assigned to the user.',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    description: 'Full name of the user.',
    type: String,
  })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiPropertyOptional({
    description: 'Email address of the user.',
    type: String,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user.',
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(7)
  phoneNumber?: string;
}
