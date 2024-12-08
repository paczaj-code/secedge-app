import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Site } from '../entities/site.entity';
import { EntityManager } from 'typeorm';
import { FakeUserService } from './services/fake.user.service';
import { fakeSites } from './services/fake.site';

/**
 * Provides functionality for seeding database data,
 * managing the insertion of fake users and sites,
 * and truncating tables.
 */
@Injectable()
export class SeederService {
  private static readonly SELECT_TABLE_NAMES_SQL = `
  SELECT table_name
    FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE'
`;

  private static readonly SELECT_SEQUENCE_NAMES_SQL = `
  SELECT sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema='public'
  `;

  private static readonly TRUNCATE_TABLE_SQL = (tableName: string) => `
  TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE;
`;

  private static readonly RESTART_SEQUENCE_SQL = (sequence_name: string) =>
    `ALTER SEQUENCE ${sequence_name} RESTART 1;`;

  constructor(
    private entityManager: EntityManager,
    private faker: FakeUserService,
  ) {}

  /**
   * Seeds the database with initial data. This includes truncating existing
   * tables, and then populating the database with site and user data.
   *
   * @return {Promise<void>} A promise that resolves when the database
   * seeding is complete.
   */
  async seedDatabaseData(): Promise<void> {
    await this.truncateTables();
    await this.seedSites();
    await this.seedUsers();
  }

  /**
   * Seeds the database with fake user data.
   *
   * This method generates 50 fake user records using the Faker library and
   * inserts them into the database using the provided entity manager.
   *
   * @return {Promise<void>} A promise that resolves when the seeding operation is complete.
   */
  async seedUsers(): Promise<void> {
    await this.entityManager.save(User, await this.faker.generateFakeUsers(50));
    await this.entityManager.save(
      User,
      await this.faker.generateFakeUsers(3, 'SHIFT_SUPERVISOR', 200),
    );
    await this.entityManager.save(
      User,
      await this.faker.generateFakeUsers(1, 'TEAM_LEADER', 100),
    );
  }

  /**
   * Seeds the database with a predefined list of sites.
   *
   * This method uses the entity manager to insert a collection of site entities
   * into the database. The site entities are defined in the `fakeSites` collection.
   *
   * @return {Promise<void>} A promise that resolves when the sites have been successfully inserted.
   */
  async seedSites(): Promise<void> {
    await this.entityManager.insert(Site, fakeSites);
  }

  /**
   * Truncates all tables in the public schema of the database.
   *
   * This method selects all table names in the public schema and truncates each table,
   * restarting their identities and sequences.
   *
   * @return {Promise<void>} A promise that resolves when all tables are truncated.
   */

  private async truncateTable(table: { table_name: string }): Promise<void> {
    await this.entityManager.query(
      SeederService.TRUNCATE_TABLE_SQL(table.table_name),
    );
  }

  private async restartSequence(sequence: {
    sequence_name: string;
  }): Promise<void> {
    await this.entityManager.query(
      SeederService.RESTART_SEQUENCE_SQL(sequence.sequence_name),
    );
  }
  async truncateTables(): Promise<void> {
    const tables: { table_name: string }[] = await this.entityManager.query(
      SeederService.SELECT_TABLE_NAMES_SQL,
    );

    const sequences: { sequence_name: string }[] =
      await this.entityManager.query(SeederService.SELECT_SEQUENCE_NAMES_SQL);
    for (const table of tables) {
      await this.truncateTable(table);
    }
    for (const sequence of sequences) {
      await this.restartSequence(sequence);
    }
  }

  // readSqlFile(filePath: string): string[] {
  //   return fs
  //     .readFileSync(path.join('src', 'seeder', filePath))
  //     .toString()
  //     .replace(/\r?\n|\r/g, '')
  //     .split(';')
  //     .filter((query) => query?.length);
  // }
}
