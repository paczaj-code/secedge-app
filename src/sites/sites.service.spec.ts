import { Test, TestingModule } from '@nestjs/testing';
import { SitesService } from './sites.service';
import { Site } from '../entities/site.entity';
import { EntityManager, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BaseDatabaseService } from '../generic/baseDatabase/baseDatabase.service';
import { HttpException } from '@nestjs/common';

describe('SitesService', () => {
  let service: SitesService, siteRepository: Repository<Site>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitesService,
        BaseDatabaseService,
        EntityManager,
        {
          provide: getRepositoryToken(Site),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<SitesService>(SitesService);
    siteRepository = module.get<Repository<Site>>(getRepositoryToken(Site));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new site successfully', async () => {
      const createSiteDto = {
        name: 'WAW01',
        address: '123 Main St',
        description: 'A great place',
      };
      const createdSite = {
        ...createSiteDto,
        id: 1,
        uuid: 'baseDatabase-uuid',
      };

      jest
        .spyOn(service as any, 'validateNameUnique')
        .mockResolvedValue(undefined);
      jest
        .spyOn(service['databaseService2'], 'createEntity')
        .mockResolvedValue({
          generatedMaps: {
            id: 1,
            uuid: 'baseDatabase-uuid',
          },
        });

      const result = await service.create(createSiteDto);

      expect(result).toEqual(createdSite);
      expect(service['validateNameUnique']).toHaveBeenCalledWith('WAW01');
      expect(service['databaseService2'].createEntity).toHaveBeenCalledWith(
        Site,
        createSiteDto,
      );
    });

    it('should throw an error if site name is not unique', async () => {
      const createSiteDto = {
        name: 'WAW01',
        address: '123 Main St',
        description: 'A great place',
      };

      jest
        .spyOn(service as any, 'validateNameUnique')
        .mockRejectedValue(new Error('Such site name already exists'));

      await expect(service.create(createSiteDto)).rejects.toThrow(
        'Such site name already exists',
      );
      expect(service['validateNameUnique']).toHaveBeenCalledWith('WAW01');
    });
  });

  describe('findAll', () => {
    it('should return an array of sites', async () => {
      const sites = [
        {
          id: 1,
          name: 'Site 1',
          address: 'Address 1',
          description: 'Description 1',
        },
        {
          id: 2,
          name: 'Site 2',
          address: 'Address 2',
          description: 'Description 2',
        },
      ];
      jest.spyOn(siteRepository, 'createQueryBuilder').mockReturnValue({
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(sites),
      } as any);

      const result = await service.findAll();
      expect(result).toEqual(sites);
      expect(siteRepository.createQueryBuilder).toHaveBeenCalledWith('site');
      expect(siteRepository.createQueryBuilder().orderBy).toHaveBeenCalledWith(
        'site.name',
      );
      expect(siteRepository.createQueryBuilder().getMany).toHaveBeenCalled();
    });

    it('should return an empty array if no sites found', async () => {
      jest.spyOn(siteRepository, 'createQueryBuilder').mockReturnValue({
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(siteRepository.createQueryBuilder).toHaveBeenCalledWith('site');
      expect(siteRepository.createQueryBuilder().orderBy).toHaveBeenCalledWith(
        'site.name',
      );
      expect(siteRepository.createQueryBuilder().getMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find and return the site by uuid', async () => {
      const uuid = 'baseDatabase-uuid';
      const site = {
        id: 1,
        uuid,
        name: 'Test Site',
        address: 'Test Address',
        description: 'Test Description',
        created_at: undefined,
        updated_at: undefined,
      };

      jest.spyOn(siteRepository, 'findOne').mockResolvedValue(site);

      const result = await service.findOne(uuid);

      expect(result).toEqual(site);
      expect(siteRepository.findOne).toHaveBeenCalledWith({ where: { uuid } });
    });

    it('should throw an HttpException if site not found', async () => {
      const uuid = 'nonexistent-uuid';

      jest.spyOn(siteRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(uuid)).rejects.toThrow('Site not found');
      expect(siteRepository.findOne).toHaveBeenCalledWith({ where: { uuid } });
    });
  });
  describe('update', () => {
    it('should update a site successfully', async () => {
      const uuid = 'baseDatabase-uuid';
      const updateSiteDto = { name: 'Updated Name', address: '456 Another St' };
      const updatedSite = { id: 1, uuid, ...updateSiteDto };

      jest
        .spyOn(service as any, 'validateNameUnique')
        .mockResolvedValue(undefined);
      jest
        .spyOn(service['databaseService2'], 'updateEntity')
        .mockResolvedValue(updatedSite);

      const result = await service.update(uuid, updateSiteDto);

      expect(result).toEqual(updatedSite);
      expect(service['validateNameUnique']).toHaveBeenCalledWith(
        updateSiteDto.name,
        uuid,
      );
      expect(service['databaseService2'].updateEntity).toHaveBeenCalledWith(
        Site,
        uuid,
        updateSiteDto,
      );
    });

    it('should throw an error if site name is not unique', async () => {
      const uuid = 'baseDatabase-uuid';
      const updateSiteDto = {
        name: 'Non-unique Name',
        address: '456 Another St',
      };

      jest
        .spyOn(service as any, 'validateNameUnique')
        .mockRejectedValue(new Error('Such site name already exists'));

      await expect(service.update(uuid, updateSiteDto)).rejects.toThrow(
        'Such site name already exists',
      );
      expect(service['validateNameUnique']).toHaveBeenCalledWith(
        updateSiteDto.name,
        uuid,
      );
    });
  });

  describe('validateNameUnique', () => {
    it('should not throw an error if name is unique', async () => {
      jest.spyOn(siteRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.validateNameUnique('unique-name'),
      ).resolves.toBeUndefined();
      expect(siteRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'unique-name' },
      });
    });

    it('should throw an error if name is not unique', async () => {
      const existingSite = {
        id: 1,
        name: 'existing-name',
        uuid: 'baseDatabase-uuid',
        address: 'baseDatabase-address',
        description: 'baseDatabase-description',
        created_at: undefined,
        updated_at: undefined,
      };
      jest.spyOn(siteRepository, 'findOne').mockResolvedValue(existingSite);

      await expect(service.validateNameUnique('existing-name')).rejects.toThrow(
        HttpException,
      );
      expect(siteRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'existing-name' },
      });
    });
  });
});
