import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RoleGuard } from '../auth/guards/role.quard';
import { User } from '../entities/user.entity';
// import { RoleGuard } from 'path-to-your-role-guard';
// import { User } from './user.entity';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result: User[] = [];
      mockUsersService.findAll.mockResolvedValue(result);

      expect(await usersController.findAll({})).toBe(result);
      expect(usersService.findAll).toHaveBeenCalledWith(
        NaN,
        NaN,
        undefined,
        undefined,
        {},
      );
    });

    it('should call usersService with correct parameters', async () => {
      const params = {
        page: '1',
        perPage: '10',
        orderBy: 'name',
        order: 'ASC',
      };
      const result: User[] = [];
      mockUsersService.findAll.mockResolvedValue(result);

      await usersController.findAll(params);

      expect(usersService.findAll).toHaveBeenCalledWith(
        1,
        10,
        'name',
        'ASC',
        {},
      );
    });
  });
});
