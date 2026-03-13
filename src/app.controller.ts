import { Controller, Get } from '@nestjs/common';
import { AppEntity } from './app/entities/app.entity';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getAppInfo(): AppEntity {
    return this.appService.getAppInfo();
  }
}
