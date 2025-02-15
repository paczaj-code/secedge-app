import { User } from '../../entities/user.entity';
import { fakerPL as faker } from '@faker-js/faker';
import * as argon2 from 'argon2';
import { UserRoles } from '../../enums/userRoles';
import { fakeSites } from './fake.site';
import { Injectable } from '@nestjs/common';
import { Site } from '../../entities/site.entity';

@Injectable()
/**
 * Represents a fake user generator. Provides methods to generate and manipulate fake user data.
 */
export class FakeUserService {
  firstName: string;
  lastName: string;
  defaultSite: Site;
  otherSites: Site[];

  async generateFakeUsers(
    amount: number = 10,
    role: UserRoles = 'OFFICER',
    seed: number = 333,
  ): Promise<Partial<User>[]> {
    const users: Partial<User>[] = [];
    faker.seed(seed);
    for (let i = 0; i < amount; i++) {
      users.push(await this.fakeUser(role));
    }
    return users;
  }

  /**
   * Generates a fake user with random data for testing purposes.
   *
   * @return {Promise<Partial<User>>} A promise that resolves to a partially complete user object.
   */
  async fakeUser(role: UserRoles = 'OFFICER'): Promise<Partial<User>> {
    this.firstName = faker.person.firstName();
    this.lastName = faker.person.lastName();
    this.defaultSite = faker.helpers.arrayElement(fakeSites);

    return {
      first_name: this.firstName,
      last_name: this.lastName,
      email:
        this.removeAccents(this.firstName).toLowerCase() +
        '.' +
        this.removeAccents(this.lastName).toLowerCase() +
        '@example.com',
      is_init_password: faker.datatype.boolean(0.2),
      phone: faker.phone.number({ style: 'national' }),
      is_active: faker.datatype.boolean(0.95),
      hashed_password: await argon2.hash('Pass@123'),
      role,
      default_site: this.defaultSite,
      other_sites: this.randomOtherSite(
        fakeSites.filter((site) => site.id !== this.defaultSite.id),
      ),
    };
  }

  /**
   * Removes accents from the given string and normalizes special characters.
   *
   * @param {string} str - The input string from which accents need to be removed.
   * @return {string} - The normalized string with accents removed.
   */
  removeAccents(str: string): string {
    {
      const result = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return result.replace(/\u0142/g, 'l').replace(/\u0141/g, 'L');
    }
  }

  randomOtherSite(sites: Site[]): Site[] | [] {
    const randomFactor = Math.floor(Math.random() * 11);
    if (randomFactor > 0 && randomFactor <= 1) {
      return [];
    } else if (randomFactor > 1 && randomFactor <= 8) {
      return faker.helpers.arrayElements(sites, 1);
    } else {
      return faker.helpers.arrayElements(sites, 2);
    }
  }
}
