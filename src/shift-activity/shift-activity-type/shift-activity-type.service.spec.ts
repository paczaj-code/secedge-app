import { Test, TestingModule } from '@nestjs/testing';
import { ShiftActivityTypeService } from './shift-activity-type.service';

describe('ShiftActivityTypeService', () => {
  let service: ShiftActivityTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShiftActivityTypeService],
    }).compile();

    service = module.get<ShiftActivityTypeService>(ShiftActivityTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
