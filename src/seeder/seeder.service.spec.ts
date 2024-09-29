import { SeederService } from './seeder.service';
import { EntityManager } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('typeorm', () => ({ EntityManager: jest.fn().mockImplementation() }));

describe('SeederService', () => {
  let service: SeederService;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeederService, EntityManager],
    }).compile();

    service = module.get<SeederService>(SeederService);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  describe('seedDatabaseData', () => {
    it('Should call seedUsers, seedSites, seedRoles, and truncateTables', async () => {
      const truncateTablesSpy = jest
        .spyOn(service, 'truncateTables')
        .mockResolvedValue(undefined);
      const seedRolesSpy = jest
        .spyOn(service, 'seedRoles')
        .mockResolvedValue(undefined);
      const seedSitesSpy = jest
        .spyOn(service, 'seedSites')
        .mockResolvedValue(undefined);
      const seedUsersSpy = jest
        .spyOn(service, 'seedUsers')
        .mockResolvedValue(undefined);

      await service.seedDatabaseData();

      expect(truncateTablesSpy).toHaveBeenCalled();
      expect(truncateTablesSpy).toHaveBeenCalledTimes(1);
      expect(seedRolesSpy).toHaveBeenCalled();
      expect(seedSitesSpy).toHaveBeenCalled();
      expect(seedUsersSpy).toHaveBeenCalled();
    });
  });
});
