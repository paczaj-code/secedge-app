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
  it('should be defined', () => {
    expect(seederController).toBeDefined();
  });
  it('should seed database', async () => {
    const result = {}; // Define the expected result here.
    const seed = jest
      .spyOn(seederService, 'seedDatabaseData')
      .mockResolvedValue(undefined);
    expect(await seederController.seedDatabase()).toBe(undefined);
    expect(seed).toHaveBeenCalled();
    expect(seed).toHaveBeenCalledTimes(1);
  });
});
