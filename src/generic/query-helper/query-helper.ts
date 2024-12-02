import { SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';

interface PaginationOptions {
  page: number;
  perPage: number;
}

interface FilterOptions {
  [key: string]: string;
}

@Injectable()
export class QueryHelper<T> {
  private readonly queryBuilder: SelectQueryBuilder<T>;

  constructor(queryBuilder: SelectQueryBuilder<T>) {
    this.queryBuilder = queryBuilder;
  }

  applyPagination({ page, perPage }: PaginationOptions): this {
    const offset = (page - 1) * perPage;
    this.queryBuilder.skip(offset).take(perPage);
    return this;
  }

  applyFilters(filters: FilterOptions, entity: string): this {
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      this.queryBuilder.andWhere(`LOWER(${entity}.${key}) LIKE :${key}`, {
        [key]: `%${value.toLowerCase()}%`,
      });
    });
    return this;
  }

  getQueryBuilder(): SelectQueryBuilder<T> {
    return this.queryBuilder;
  }
}
