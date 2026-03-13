import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePhoneNumber } from '../utils/helpers';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        firebaseUid: createUserDto.firebaseUid,
        role: createUserDto.role,
        fullName: createUserDto.fullName,
        email: createUserDto.email,
        phoneNumber: createUserDto.phoneNumber
          ? normalizePhoneNumber(createUserDto.phoneNumber)
          : undefined,
      },
    });
  }

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found.`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        firebaseUid: updateUserDto.firebaseUid,
        role: updateUserDto.role,
        fullName: updateUserDto.fullName,
        email: updateUserDto.email,
        phoneNumber: updateUserDto.phoneNumber
          ? normalizePhoneNumber(updateUserDto.phoneNumber)
          : undefined,
      },
    });
  }
}
