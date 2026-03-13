import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AllowUnsyncedAuth } from './decorators/allow-unsynced-auth.decorator';
import {
  AuthMeEntity,
  AuthSignupEntity,
  AuthSyncProfileEntity,
} from './entities/auth.entity';
import { AuthService } from './auth.service';
import { AuthContext, CurrentAuth } from './decorators/current-auth.decorator';
import { SyncProfileDto } from './dto/sync-profile.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  signup(@Body() dto: SignupDto): Promise<AuthSignupEntity> {
    return this.authService.signup(dto);
  }

  @AllowUnsyncedAuth()
  @Get('me')
  me(@CurrentAuth() auth: AuthContext): AuthMeEntity {
    return this.authService.me(auth);
  }

  @AllowUnsyncedAuth()
  @Post('sync-profile')
  async syncProfile(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: SyncProfileDto,
  ): Promise<AuthSyncProfileEntity> {
    return this.authService.syncProfile(auth, dto);
  }
}
