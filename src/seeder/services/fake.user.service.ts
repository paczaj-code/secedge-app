import { User } from '../../entities/user.entity';
import { fakerPL as faker } from '@faker-js/faker';
import * as argon2 from 'argon2';
import { UserRoles } from '../../enums/userRoles';
import { fakeSites } from './fake.site';
import { Injectable } from '@nestjs/common';

@Injectable()
/**
 * Represents a fake user generator. Provides methods to generate and manipulate fake user data.
 */
export class FakeUserService {
  firstName: string;
  lastName: string;

  async generateFakeUsers(amount: number = 10): Promise<Partial<User>[]> {
    const users: Partial<User>[] = [];
    faker.seed(333);
    for (let i = 0; i < amount; i++) {
      users.push(await this.fakeUser());
    }
    return users;
  }

  /**
   * Generates a fake user with random data for testing purposes.
   *
   * @return {Promise<Partial<User>>} A promise that resolves to a partially complete user object.
   */
  async fakeUser(role: UserRoles = 'USER'): Promise<Partial<User>> {
    this.firstName = faker.person.firstName();
    this.lastName = faker.person.lastName();

    return {
      uuid: faker.string.uuid(),
      first_name: this.firstName,
      last_name: this.lastName,
      email:
        this.removeAccents(this.firstName).toLowerCase() +
        '.' +
        this.removeAccents(this.lastName).toLowerCase() +
        '@example.com',
      is_init_password: faker.datatype.boolean(0.2),
      phone: faker.phone.number({ style: 'national' }),
      is_active: faker.datatype.boolean(0.9),
      hashed_password: await argon2.hash('Pass@123'),
      role,
      default_site: faker.helpers.arrayElement(fakeSites),
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
}
