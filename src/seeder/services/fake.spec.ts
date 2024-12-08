import { FakeUserService } from './fake.user.service';
import * as argon2 from 'argon2';
import { Test, TestingModule } from '@nestjs/testing';

describe('FakeUserService', () => {
  let service: FakeUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FakeUserService],
    }).compile();

    service = module.get<FakeUserService>(FakeUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate fake user data', async () => {
    const user = await service.fakeUser();
    expect(user.first_name).toMatch(/\w+/);
    expect(user.last_name).toMatch(/\w+/);
    expect(user.email).toMatch(/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/);
    expect(user.phone).toMatch(/\d+/);
    +expect(await argon2.verify(user.hashed_password, 'Pass@123')).toBe(true);
    expect(user.role).toEqual('OFFICER');
  });

  it('should remove accents', () => {
    const str = 'Résumé Łódź';
    const expectedStr = 'Resume Lodz';
    expect(service.removeAccents(str)).toBe(expectedStr);
  });

  it('should generate specified amount of fake users', async () => {
    const users = await service.generateFakeUsers(5);
    expect(users.length).toBe(5);
  });
});
