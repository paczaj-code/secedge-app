import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Site } from '../entities/site.entity';
import * as fs from 'fs';
import * as path from 'node:path';
import { EntityManager } from 'typeorm';
import { FakeUserService } from './services/fake.user.service';
import { fakeSites } from './services/fake.site';

@Injectable()
export class SeederService {
  constructor(
    private entityManager: EntityManager,
    private faker: FakeUserService,
  ) {}

  async seedDatabaseData() {
    await this.truncateTables();
    await this.seedSites();
    await this.seedUsers();
  }

  async seedUsers() {
    await this.entityManager.insert(
      User,
      await this.faker.generateFakeUsers(50),
    );
  }

  async seedSites() {
    await this.entityManager.insert(Site, fakeSites);
  }

  async truncateTables() {
    const tables = await this.entityManager.query(
      `
    SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='public' AND table_type='BASE TABLE'
    `,
    );
    for (const table of tables) {
      await this.entityManager.query(
        `TRUNCATE TABLE ${table.table_name} RESTART IDENTITY CASCADE;
        ALTER SEQUENCE ${table.table_name}_id_seq RESTART 1;
        `,
      );
    }
  }

  readSqlFile(filePath: string): string[] {
    return fs
      .readFileSync(path.join('src', 'seeder', filePath))
      .toString()
      .replace(/\r?\n|\r/g, '')
      .split(';')
      .filter((query) => query?.length);
  }
}
