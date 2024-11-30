import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';

export class PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class PaginatorService<T> {
  constructor(private readonly queryBuilder: SelectQueryBuilder<T>) {}

  async paginate(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResult<T>> {
    const [items, total] = await this.queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }
}
