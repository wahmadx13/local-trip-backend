import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../../users/entities/user.entity';
import { AuthFirebaseUserEntity } from '../entities/auth.entity';

export interface AuthContext {
  firebaseUser: AuthFirebaseUserEntity;
  user: UserEntity | null;
}

export const CurrentAuth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthContext => {
    const request = ctx.switchToHttp().getRequest<{ auth: AuthContext }>();
    return request.auth;
  },
);
