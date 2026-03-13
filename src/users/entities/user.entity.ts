import { ApiProperty } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserEntity {
  @ApiProperty({ description: 'Unique database identifier of the user.' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    description: 'Firebase Authentication UID linked to the user.',
  })
  @IsString()
  @IsNotEmpty()
  firebaseUid!: string;

  @ApiProperty({
    description: 'Application role assigned to the user.',
    enum: Role,
  })
  @IsEnum(Role)
  role!: User['role'];

  @ApiProperty({ description: 'Full name of the user.' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    description: 'Email address of the user when available.',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsEmail()
  email!: string | null;

  @ApiProperty({
    description: 'Phone number of the user when available.',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  phoneNumber!: string | null;

  @ApiProperty({ description: 'Date and time when the user was created.' })
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ description: 'Date and time when the user was last updated.' })
  @IsDate()
  updatedAt!: Date;
}
