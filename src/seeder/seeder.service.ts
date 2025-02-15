import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Site } from '../entities/site.entity';
import { EntityManager } from 'typeorm';
import { FakeUserService } from './services/fake.user.service';
import { FakeActivityService } from './services/fake.activity.service';
import { fakeSites } from './services/fake.site';
import { fakeActivities } from './services/fake.activities';
import { ShiftActivity } from '../entities/shift-activity.entity';
import { fakerPL } from '@faker-js/faker';

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
    private activityService: FakeActivityService,
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
    await this.seedActivities();
    await this.activityService.generateFakeActivities();
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

  async seedActivities(): Promise<void> {
    const activities: ShiftActivity[] = [];
    for (const activity of fakeActivities) {
      const fakeActivity: Partial<ShiftActivity> = {
        name: activity,
        description: 'Description of ' + activity,
        uuid: fakerPL.string.uuid(),
        updated_at: new Date(),
        created_at: new Date(),
      };
      activities.push(fakeActivity as ShiftActivity);
    }
    await this.entityManager.insert(ShiftActivity, activities);
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

  /**
   * Restarts a specified database sequence.
   *
   * @param {Object} sequence - The sequence details.
   * @param {string} sequence.sequence_name - The name of the sequence to be restarted.
   * @return {Promise<void>} A promise that resolves when the sequence has been restarted.
   */
  private async restartSequence(sequence: {
    sequence_name: string;
  }): Promise<void> {
    await this.entityManager.query(
      SeederService.RESTART_SEQUENCE_SQL(sequence.sequence_name),
    );
  }
  /**
   * Truncates all tables and restarts all sequences in the database.
   *
   * This method retrieves the names of all tables and sequences in the database,
   * truncates each table to remove all of its rows, and restarts each sequence
   * to reset its value. It processes each table and sequence individually.
   *
   * @return {Promise<void>} A promise that resolves when all operations are complete.
   */
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
