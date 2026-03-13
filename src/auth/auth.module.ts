import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase/firebase-auth.guard';
import { FirebaseAdminProvider } from './firebase/firebase-admin.provider';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    FirebaseAdminProvider,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
  exports: [AuthService, FirebaseAdminProvider],
})
export class AuthModule {}
