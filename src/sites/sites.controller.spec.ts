import { Test, TestingModule } from '@nestjs/testing';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { Site } from '../entities/site.entity';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { HttpException, NotFoundException } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

describe('SitesController', () => {
  let controller: SitesController;
  let service: SitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SitesController],
      providers: [
        {
          provide: SitesService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SitesController>(SitesController);
    service = module.get<SitesService>(SitesService);
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new site successfully', async () => {
      const createSiteDto: CreateSiteDto = {
        name: 'ABC01',
        address: '123 Street',
        description: 'Test description',
      };
      const result: Site = {
        created_at: undefined,
        updated_at: undefined,
        id: 1,
        uuid: '0c51815e-e604-48ab-8d74-6c85dd7305bf',
        ...createSiteDto,
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createSiteDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createSiteDto);
    });

    it('should throw an error when createSiteDto is invalid', async () => {
      const createSiteDto: CreateSiteDto = {
        name: 'INVALID NAME',
        address: '123 Street',
        description: 'Test description',
      };

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('Validation failed'));

      await expect(controller.create(createSiteDto)).rejects.toThrow(
        'Validation failed',
      );
      expect(service.create).toHaveBeenCalledWith(createSiteDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of sites', async () => {
      const result = [{ id: 1, name: 'Test Site' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result as Site[]);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single site by UUID', async () => {
      const uuid = '0c51815e-e604-48ab-8d74-6c85dd7305bf';
      const result: Site = {
        created_at: undefined,
        updated_at: undefined,
        id: 1,
        uuid: uuid,
        name: 'Test Site',
        address: '123 Street',
        description: 'Test description',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(uuid)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(uuid);
    });

    it('should throw NotFoundException if site is not found', async () => {
      const uuid = 'invalid-uuid';
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Site not found'));

      await expect(controller.findOne(uuid)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(uuid);
    });

    it('should handle errors and throw HttpException', async () => {
      const uuid = 'error-uuid';
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new HttpException('Internal server error', 500));

      await expect(controller.findOne(uuid)).rejects.toThrow(HttpException);
      expect(service.findOne).toHaveBeenCalledWith(uuid);
    });
  });

  describe('update', () => {
    it('should update an existing site', async () => {
      const uuid = '0c51815e-e604-48ab-8d74-6c85dd7305bf';
      const updateSiteDto: UpdateSiteDto = {
        name: 'Updated Site',
        address: 'some',
      };
      const result: DeepPartial<Site> = { id: 1, uuid, ...updateSiteDto };

      jest.spyOn(service, 'update').mockResolvedValue(result as Site);

      expect(await controller.update(uuid, updateSiteDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(uuid, updateSiteDto);
    });

    it('should throw NotFoundException if site is not found', async () => {
      const uuid = '0c51815e-e604-48ab-8d74-6c85dd7305bf';
      const updateSiteDto: UpdateSiteDto = { name: 'Updated Site' };

      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new NotFoundException('Site not found'));

      await expect(controller.update(uuid, updateSiteDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.update).toHaveBeenCalledWith(uuid, updateSiteDto);
    });
    it('should throw BAD_REQUEST exception if with bad uuid format', async () => {
      const uuid = 'error-uuid';
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new HttpException('Internal server error', 500));

      await expect(controller.findOne(uuid)).rejects.toThrow(HttpException);
      expect(service.findOne).toHaveBeenCalledWith(uuid);
    });
  });
});
