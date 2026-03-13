import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeEmail, normalizePhoneNumber } from '../utils/helpers';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

type CreateAuthUserInput = Pick<
  UserEntity,
  'firebaseUid' | 'fullName' | 'role'
> & {
  email?: string;
  phoneNumber?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeUserInput<
    T extends { email?: string; phoneNumber?: string },
  >(data: T): T {
    return {
      ...data,
      email: data.email ? normalizeEmail(data.email) : undefined,
      phoneNumber: data.phoneNumber
        ? normalizePhoneNumber(data.phoneNumber)
        : undefined,
    };
  }

  create(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.prisma.user.create({
      data: this.normalizeUserInput(createUserDto),
    });
  }

  findAll(): Promise<UserEntity[]> {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findByFirebaseUid(firebaseUid: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
    });
  }

  createFromAuth(input: CreateAuthUserInput): Promise<UserEntity> {
    return this.prisma.user.create({
      data: this.normalizeUserInput(input),
    });
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found.`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: this.normalizeUserInput(updateUserDto),
    });
  }
}
