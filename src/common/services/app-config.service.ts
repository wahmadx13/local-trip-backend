import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_NAME_FALLBACK } from '../../utils/constants';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get appName(): string {
    return (
      this.configService.get<string>('app.name') ??
      this.configService.get<string>('APP_NAME') ??
      APP_NAME_FALLBACK
    );
  }

  get appEnv(): string {
    return (
      this.configService.get<string>('app.env') ??
      this.configService.get<string>('APP_ENV') ??
      'development'
    );
  }

  get port(): number {
    return this.configService.get<number>('port') ?? 0;
  }

  get corsOrigins(): string[] {
    return this.configService.get<string[]>('cors.origins') ?? [];
  }

  get databaseUrl(): string {
    return this.configService.get<string>('database.url') ?? '';
  }
}
