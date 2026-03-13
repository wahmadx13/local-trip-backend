import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigService } from './common/services/app-config.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: AppConfigService,
          useValue: {
            appName: 'Local Trip API',
            appEnv: 'test',
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return app metadata', () => {
      expect(appController.getAppInfo()).toEqual({
        name: 'Local Trip API',
        environment: 'test',
        message: 'Local Trip backend is running.',
      });
    });
  });
});
