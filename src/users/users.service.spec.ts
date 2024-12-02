import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from '../entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findUserByEmail', () => {
    it('should return user if found by email', async () => {
      const email = 'test@example.com';
      const mockUser = new User();
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      expect(await service.findUserByEmail(email)).toEqual(mockUser);
    });

    it('should throw HttpException if user is not found', async () => {
      const email = 'notfound@example.com';
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValueOnce(
          new HttpException('User not found', HttpStatus.NOT_FOUND),
        );

      await expect(service.findUserByEmail(email)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
