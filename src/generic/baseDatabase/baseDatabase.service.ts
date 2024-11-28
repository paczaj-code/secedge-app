import { EntityManager, EntityTarget } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BaseDatabaseService<T> {
  constructor(private entityManager: EntityManager) {}

  public async listEntities(entity: EntityTarget<T>): Promise<T[]> {
    return this.entityManager.find(entity);
  }

  async createEntity(entity: EntityTarget<T>, dto: any): Promise<any> {
    const queryBuilder = this.entityManager
      .createQueryBuilder()
      .insert()
      .into(entity)
      .values(dto);

    const result = await queryBuilder.execute();
    return result.generatedMaps[0];
  }

  async updateEntity(entity: EntityTarget<T>, uuid: string, dto: any) {
    const queryBuilder = this.entityManager
      .createQueryBuilder()
      .update(entity)
      .set(dto)
      .where('uuid = :uuid', { uuid });

    const result = await queryBuilder.execute();

    if (result.affected === 0) {
      throw new Error('Entity not found');
    }

    return dto;
  }
}
