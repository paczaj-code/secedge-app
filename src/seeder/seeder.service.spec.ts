import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from './seeder.service';
import { EntityManager } from 'typeorm';
import { FakeUserService } from './services/fake.user.service';
import { User } from '../entities/user.entity';
import { Site } from '../entities/site.entity';
import { fakeSites } from './services/fake.site';

describe('SeederService', () => {
  let service: SeederService;
  let fakeUserService: FakeUserService;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeederService, FakeUserService, EntityManager],
    }).compile();

    service = module.get<SeederService>(SeederService);
    fakeUserService = module.get<FakeUserService>(FakeUserService);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedDatabaseData', () => {
    it('should call all seed functions', async () => {
      const truncateTablesSpy = jest
        .spyOn(service, 'truncateTables')
        .mockImplementation();
      const seedSitesSpy = jest
        .spyOn(service, 'seedSites')
        .mockImplementation();
      const seedUsersSpy = jest
        .spyOn(service, 'seedUsers')
        .mockImplementation();

      await service.seedDatabaseData();

      expect(truncateTablesSpy).toHaveBeenCalled();
      expect(seedSitesSpy).toHaveBeenCalled();
      expect(seedUsersSpy).toHaveBeenCalled();
    });
  });

  describe('seedUsers', () => {
    it('should generate users and insert them', async () => {
      const fakeUsers = [{ id: 1 }, { id: 2 }];
      jest
        .spyOn(fakeUserService, 'generateFakeUsers')
        .mockResolvedValue(fakeUsers);
      const insertSpy = jest
        .spyOn(entityManager, 'insert')
        .mockImplementation();

      await service.seedUsers();

      expect(insertSpy).toHaveBeenCalledWith(User, fakeUsers);
    });
  });

  describe('seedSites', () => {
    it('should insert sites', async () => {
      const insertSpy = jest
        .spyOn(entityManager, 'insert')
        .mockImplementation();

      await service.seedSites();

      expect(insertSpy).toHaveBeenCalledWith(Site, fakeSites);
    });
  });

  describe('truncateTables', () => {
    it('should truncate all tables', async () => {
      const tables = [{ table_name: 'users' }, { table_name: 'sites' }];
      jest.spyOn(entityManager, 'query').mockResolvedValue(tables);

      await service.truncateTables();

      tables.forEach((table) => {
        expect(entityManager.query).toHaveBeenCalledWith(
          expect.stringContaining(
            `TRUNCATE TABLE ${table.table_name} RESTART IDENTITY CASCADE`,
          ),
        );
      });
    });
  });
});
