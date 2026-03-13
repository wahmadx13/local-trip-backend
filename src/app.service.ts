import { Injectable } from '@nestjs/common';
import { AppEntity } from './app/entities/app.entity';
import { AppConfigService } from './common/services/app-config.service';

@Injectable()
export class AppService {
  constructor(private readonly configService: AppConfigService) {}

  getAppInfo(): AppEntity {
    return {
      name: this.configService.appName,
      environment: this.configService.appEnv,
      message: 'Local Trip backend is running.',
    };
  }
}
