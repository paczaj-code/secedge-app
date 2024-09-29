import { Test, TestingModule } from '@nestjs/testing';
import { SeederController } from './seeder.controller';
import { SeederService } from './seeder.service';

describe('SeederController', () => {
  let seederController: SeederController;
  let seederService: SeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeederController],
      providers: [
        { provide: SeederService, useValue: { seedDatabaseData: jest.fn() } },
      ],
    }).compile();

    seederController = module.get<SeederController>(SeederController);
    seederService = module.get<SeederService>(SeederService);
  });

  it('should call the seederService.seedDatabaseData method when seedDatabase is called', () => {
    seederController.seedDatabase();
    expect(seederService.seedDatabaseData).toBeCalled();
  });
});
