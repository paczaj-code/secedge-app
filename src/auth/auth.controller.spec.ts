import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refreshAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller.refreshToken).toBeDefined();
  });

  it('should call AuthService.login with correct credentials', async () => {
    const credentials: LoginDto = {
      email: 'test@example.com',
      password: 'password',
    };
    await controller.login(credentials);
    expect(service.login).toHaveBeenCalledWith(credentials);
  });

  it('should throw an error if credentials are invalid', async () => {
    jest
      .spyOn(service, 'login')
      .mockRejectedValue(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
    const credentials: LoginDto = { email: '', password: '' };

    await expect(controller.login(credentials)).rejects.toThrow(HttpException);
    await expect(controller.login(credentials)).rejects.toThrow(
      'Invalid credentials',
    );
  });
  it('should call AuthService.refreshAccessToken with correct token', async () => {
    const mockToken = 'test-token';
    const request = {
      headers: { authorization: `Bearer ${mockToken}` },
    } as any;
    await controller.refreshToken(request);
    expect(service.refreshAccessToken).toHaveBeenCalledWith(mockToken);
  });

  it('should throw an error if no token is provided', async () => {
    const request = { headers: {} } as any;
    await expect(controller.refreshToken(request)).rejects.toThrow(
      HttpException,
    );
    await expect(controller.refreshToken(request)).rejects.toThrow(
      'Invalid token',
    );
  });
});
