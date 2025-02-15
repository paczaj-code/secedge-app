import { Test, TestingModule } from '@nestjs/testing';
import { ShiftActivityController } from './shift-activity.controller';
import { ShiftActivityService } from './shift-activity.service';

describe('ShiftActivityController', () => {
  let controller: ShiftActivityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftActivityController],
      providers: [ShiftActivityService],
    }).compile();

    controller = module.get<ShiftActivityController>(ShiftActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
