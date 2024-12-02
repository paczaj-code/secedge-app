import { SelectQueryBuilder } from 'typeorm';
import { QueryHelper } from './query-helper';
import { constraintToString } from 'class-validator/types/validation/ValidationUtils';

describe('QueryHelper', () => {
  let queryBuilder: SelectQueryBuilder<any>;
  let queryHelper: QueryHelper<any>;

  beforeEach(() => {
    queryBuilder = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
    } as unknown as SelectQueryBuilder<any>;
    queryHelper = new QueryHelper(queryBuilder);
  });

  it('should be defined', () => {
    const queryHelper = new QueryHelper(queryBuilder);
    expect(queryHelper).toBeDefined();
    const aa = queryHelper.getQueryBuilder();
    expect(aa).toBeDefined();
    expect(aa).toBe(queryBuilder);
  });

  describe('applyFilters', () => {
    it('should apply a single filter correctly', () => {
      const filters = { name: 'John' };
      const entity = 'user';

      queryHelper.applyFilters(filters, entity);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(user.name) LIKE :name',
        { name: '%john%' },
      );
    });

    it('should apply multiple filters correctly', () => {
      const filters = { name: 'Doe', age: '30' };
      const entity = 'user';

      queryHelper.applyFilters(filters, entity);

      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        1,
        'LOWER(user.name) LIKE :name',
        { name: '%doe%' },
      );
      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        2,
        'LOWER(user.age) LIKE :age',
        { age: '%30%' },
      );
    });

    it('should return the query helper instance', () => {
      const filters = { name: 'John' };
      const entity = 'user';

      const result = queryHelper.applyFilters(filters, entity);

      expect(result).toBe(queryHelper);
    });
  });

  describe('applyPagination', () => {
    it('should apply pagination with given page and perPage', () => {
      const page = 2;
      const perPage = 10;

      queryHelper.applyPagination({ page, perPage });

      expect(queryBuilder.skip).toHaveBeenCalledWith(10);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should handle pagination with page 1 correctly', () => {
      const page = 1;
      const perPage = 5;

      queryHelper.applyPagination({ page, perPage });

      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('should return the query helper instance', () => {
      const result = queryHelper.applyPagination({ page: 1, perPage: 5 });
      expect(result).toBe(queryHelper);
    });
  });
});
