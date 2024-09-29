import { Injectable } from '@nestjs/common';
import { fakerPL as faker } from '@faker-js/faker';
import { User } from '../users/entities/user.entity';
import { Site } from '../users/entities/site.entity';
import * as fs from 'fs';
import * as path from 'node:path';
import { EntityManager } from 'typeorm';
import { UserRole } from '../users/entities/user-role.entity';

@Injectable()
export class SeederService {
  private sites: Partial<Site>[] = [
    {
      name: 'WAW01',
      address: 'Warszawa ul.Popularna 7',
      description: 'WAW01.lorem ipsum dolor sit amet, consectetur',
    },
    {
      name: 'WAW02',
      address: 'Warszawa ul.Głąba 33',
      description: 'WAW02. Lorem ipsum dolor sit amet, consectetur',
    },
    {
      name: 'WAW03',
      address: 'Warszawa ul.Wacława 1011',
      description: 'WAW03. Lorem ipsum dolor sit amet, consectetur',
    },
  ];

  private userRoles: Partial<UserRole>[] = [
    {
      role: 'VIEWER',
      description: 'role VIEWER',
    },
    {
      role: 'USER',
      description: 'role USER',
    },
    {
      role: 'SHIFT_SUPERVISOR',
      description: 'role SHIFT_SUPERVISOR',
    },
    {
      role: 'TEAM_LEADER',
      description: 'role TEAM_LEADER',
    },
    {
      role: 'MANAGER',
      description: 'role MANAGER',
    },
    {
      role: 'SUPER_ADMIN',
      description: 'role SUPER_ADMIN',
    },
  ];
  constructor(private entityManager: EntityManager) {}

  async seedDatabaseData() {
    await this.truncateTables();
    await this.seedSites();
    await this.seedRoles();
    await this.seedUsers();
  }

  async seedUsers() {
    const queries = this.readSqlFile('./sql/users.sql');
    await this.insertData(queries);
  }

  private generateUser() {
    const user: Partial<User> = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      password_hash:
        '$argon2id$v=19$m=65536,t=3,p=4$AZp5EH6S+1bK8dsj9dcGQA$pmtAFaffXnrSOghiZp6P/RQ3MbNmB3ZfAfDmSvUTLWk',
      is_active: faker.datatype.boolean(0.9),
      is_init_password: faker.datatype.boolean(0.3),
      default_site: {
        id: faker.helpers.arrayElement([1, 2, 3]),
        address: '',
        uuid: '',
        name: '',
        description: '',
      },
      role: { id: 2, role: 'USER', description: '', uuid: '', users: [] },
    };

    return user;
  }

  async truncateTables() {
    await this.entityManager.query(
      `TRUNCATE TABLE user_roles RESTART IDENTITY CASCADE;
       TRUNCATE TABLE sites RESTART IDENTITY CASCADE;
       TRUNCATE TABLE users RESTART IDENTITY CASCADE;
      `,
    );
  }

  async seedSites() {
    const queries = this.readSqlFile('./sql/sites.sql');
    await this.insertData(queries);
  }

  async seedRoles() {
    const queries = this.readSqlFile('./sql/user_roles.sql');
    await this.insertData(queries);
  }
  readSqlFile(filePath: string): string[] {
    return fs
      .readFileSync(path.join('src', 'seeder', filePath))
      .toString()
      .replace(/\r?\n|\r/g, '')
      .split(';')
      .filter((query) => query?.length);
  }

  async insertData(queries: string[]) {
    for (const query of queries) {
      await this.entityManager.query(query);
    }
  }
}
