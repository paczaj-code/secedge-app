import { Test, TestingModule } from '@nestjs/testing';
import { PaginatorService } from './paginator.service';
import { SelectQueryBuilder } from 'typeorm';

const mockQueryBuilder = {
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

const mockQueryBuilderProvider = {
  provide: SelectQueryBuilder,
  useValue: mockQueryBuilder,
};
describe('PaginatorService', () => {
  let service: PaginatorService<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaginatorService, mockQueryBuilderProvider],
    }).compile();

    service = module.get<PaginatorService<any>>(PaginatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return correct items and total count', async () => {
    jest
      .spyOn(service['queryBuilder'], 'getManyAndCount')
      .mockResolvedValue([[{}, {}, {}], 3]);
    const result = await service.paginate(1, 10);
    expect(result.items.length).toBe(3);
    expect(result.total).toBe(3);
  });

  it('should return empty items array and zero total when no results', async () => {
    jest
      .spyOn(service['queryBuilder'], 'getManyAndCount')
      .mockResolvedValue([[], 0]);
    const result = await service.paginate(1, 10);
    expect(result.items.length).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should reflect pagination values when page and limit are provided', async () => {
    jest
      .spyOn(service['queryBuilder'], 'getManyAndCount')
      .mockResolvedValue([[{}, {}], 2]);
    const result = await service.paginate(2, 5);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
  });
});
