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

export class SyncProfileDto {
  @ApiProperty({
    description: 'Full name to store in the backend profile.',
    type: String,
  })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({
    description: 'Application role selected for the backend profile.',
    enum: Role,
  })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional({
    description: 'Email address to store in the backend profile.',
    type: String,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description:
      'Phone number to store in the backend profile in E.164 format.',
    type: String,
    example: '+491234567890',
  })
  @IsOptional()
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'phoneNumber must be in E.164 format',
  })
  phoneNumber?: string;
}
