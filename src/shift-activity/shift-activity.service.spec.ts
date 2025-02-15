import { Test, TestingModule } from '@nestjs/testing';
import { ShiftActivityService } from './shift-activity.service';

describe('ShiftActivityService', () => {
  let service: ShiftActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShiftActivityService],
    }).compile();

    service = module.get<ShiftActivityService>(ShiftActivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
