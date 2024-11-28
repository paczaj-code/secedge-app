import { Test, TestingModule } from '@nestjs/testing';
import {
  EntityManager,
  EntityTarget,
  InsertResult,
  UpdateResult,
} from 'typeorm';
import { BaseDatabaseService } from './baseDatabase.service';

describe('Base', () => {
  let service: BaseDatabaseService<any>;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseDatabaseService, EntityManager],
    }).compile();

    service = module.get<BaseDatabaseService<any>>(BaseDatabaseService);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  describe('listEntities', () => {
    it('should return an array of entities', async () => {
      const mockEntity = 'TestEntity';
      const mockResult = [{ id: 1, name: 'Test Entity' }];
      jest.spyOn(entityManager, 'find').mockResolvedValue(mockResult);

      const result = await service.listEntities(
        mockEntity as EntityTarget<any>,
      );
      expect(result).toEqual(mockResult);
    });

    it('should call entityManager.find with correct entity', async () => {
      const mockEntity = 'TestEntity';
      const mockResult = [{ id: 1, name: 'Test Entity' }];
      jest.spyOn(entityManager, 'find').mockResolvedValue(mockResult);

      await service.listEntities(mockEntity as EntityTarget<any>);
      expect(entityManager.find).toHaveBeenCalledWith(mockEntity);
    });

    it('should return an empty array if no entities found', async () => {
      const mockEntity = 'TestEntity';
      jest.spyOn(entityManager, 'find').mockResolvedValue([]);

      const result = await service.listEntities(
        mockEntity as EntityTarget<any>,
      );
      expect(result).toEqual([]);
    });
  });

  describe('createEntity', () => {
    const mockEntity = 'TestEntity';
    const mockDto = { name: 'Test Entity' };
    it('should return the generated entity when the insert is successful', async () => {
      const mockInsertResult = {
        generatedMaps: [mockDto],
      } as unknown as InsertResult;
      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockInsertResult),
      };

      jest
        .spyOn(entityManager, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.createEntity(
        mockEntity as EntityTarget<any>,
        mockDto,
      );
      expect(result).toEqual(mockDto);
    });

    it('should call createQueryBuilder and chain methods correctly', async () => {
      const mockInsertResult = {
        generatedMaps: [mockDto],
      } as unknown as InsertResult;
      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockInsertResult),
      };

      jest
        .spyOn(entityManager, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      await service.createEntity(mockEntity as EntityTarget<any>, mockDto);
      expect(mockQueryBuilder.insert).toHaveBeenCalled();
      expect(mockQueryBuilder.into).toHaveBeenCalledWith(mockEntity);
      expect(mockQueryBuilder.values).toHaveBeenCalledWith(mockDto);
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('should throw an error if the insert fails', async () => {
      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('Insert failed')),
      };

      jest
        .spyOn(entityManager, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      await expect(
        service.createEntity(mockEntity as EntityTarget<any>, mockDto),
      ).rejects.toThrow('Insert failed');
    });
  });
  describe('updateEntity', () => {
    const mockEntity = 'TestEntity';
    const uuid = 'baseDatabase-uuid';
    const mockDto = { name: 'Updated Entity' };

    it('should update an entity successfully', async () => {
      const mockUpdateResult = { affected: 1 } as UpdateResult;
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockUpdateResult),
      };

      jest
        .spyOn(entityManager, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.updateEntity(
        mockEntity as EntityTarget<any>,
        uuid,
        mockDto,
      );
      expect(result).toEqual(mockDto);
    });

    it('should throw an error if no entity is found to update', async () => {
      const mockUpdateResult = { affected: 0 } as UpdateResult;
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockUpdateResult),
      };

      jest
        .spyOn(entityManager, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      await expect(
        service.updateEntity(mockEntity as EntityTarget<any>, uuid, mockDto),
      ).rejects.toThrow('Entity not found');
    });

    it('should call queryBuilder methods correctly', async () => {
      const mockUpdateResult = { affected: 1 } as UpdateResult;
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockUpdateResult),
      };

      jest
        .spyOn(entityManager, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      await service.updateEntity(
        mockEntity as EntityTarget<any>,
        uuid,
        mockDto,
      );
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(mockEntity);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith(mockDto);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('uuid = :uuid', {
        uuid,
      });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });
});
