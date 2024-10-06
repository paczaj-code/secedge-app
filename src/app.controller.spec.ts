import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  let app: TestingModule;
  beforeEach(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('module should be defined', () => {
      expect(app).toBeDefined();
    });
    it('controller should be defined', () => {
      expect(appController).toBeDefined();
    });
    it('service should be defined', () => {
      expect(appService).toBeDefined();
    });
  });
});
