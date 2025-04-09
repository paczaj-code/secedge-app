import { Test, TestingModule } from '@nestjs/testing';
import { ShiftActivityTypeController } from './shift-activity-type.controller';
import { ShiftActivityTypeService } from './shift-activity-type.service';

describe('ShiftActivityTypeController', () => {
  let controller: ShiftActivityTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftActivityTypeController],
      providers: [ShiftActivityTypeService],
    }).compile();

    controller = module.get<ShiftActivityTypeController>(ShiftActivityTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
