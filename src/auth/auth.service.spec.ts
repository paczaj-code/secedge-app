import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';

jest.mock('argon2');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let service: AuthService;
  let userService: any;

  beforeEach(async () => {
    userService = {
      findUserByEmail: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: userService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('login', () => {
    it('should return tokens when valid credentials are provided', async () => {
      const credentials: LoginDto = {
        email: 'user@example.com',
        password: 'password123',
      };
      const user = {
        id: 1,
        uuid: 'test-uuid',
        hashed_password: 'hashed_password',
      };

      userService.findUserByEmail.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      const generateRefreshTokenSpy = jest
        .spyOn(service, 'generateRefreshToken')
        .mockReturnValue('refreshToken');
      const generateAccessTokenSpy = jest
        .spyOn(service, 'generateAccessToken')
        .mockReturnValue('accessToken');

      const result = await service.login(credentials);
      expect(result).toEqual({
        refreshToken: 'refreshToken',
        accessToken: 'accessToken',
      });
      expect(generateRefreshTokenSpy).toHaveBeenCalledWith(user);
      expect(generateAccessTokenSpy).toHaveBeenCalledWith(user);
    });

    it('should throw an UNAUTHORIZED exception when user is not found', async () => {
      const credentials: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };
      userService.findUserByEmail.mockResolvedValue(null);

      await expect(service.login(credentials)).rejects.toThrowError(
        new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw an UNAUTHORIZED exception when password does not match', async () => {
      const credentials: LoginDto = {
        email: 'user@example.com',
        password: 'wrongPassword',
      };
      const user = {
        id: 1,
        uuid: 'test-uuid',
        hashed_password: 'hashed_password',
      };

      userService.findUserByEmail.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(credentials)).rejects.toThrowError(
        new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED),
      );
    });
  });
  describe('validateAccessToken', () => {
    it('should return the decoded token when verification is successful', () => {
      const token = 'validToken';
      const decodedToken = { data: 'decoded' };
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

      const result = service.validateAccessToken(token);

      expect(result).toEqual(decodedToken);
      expect(jwt.verify).toHaveBeenCalledWith(token, service['publicKey'], {});
    });

    it('should throw an error when verification fails', () => {
      const token = 'invalidToken';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.validateAccessToken(token)).toThrow('Invalid token');
    });
  });
  it('should generate a refresh token for a valid user', () => {
    const user = { id: 1, uuid: 'test-uuid' };
    const jwtSignSpy = jest
      .spyOn(jwt, 'sign')
      .mockReturnValue('mockToken' as any);

    const token = service.generateRefreshToken(user);

    expect(jwtSignSpy).toHaveBeenCalledWith(
      { id: user.id, uuid: user.uuid },
      process.env.REFRESH_JWT_SECRET,
      {
        algorithm: 'HS512',
        audience: 'secedge',
        issuer: 'secedge',
        expiresIn: '13h',
      },
    );

    expect(token).toBe('mockToken');
  });
  it('should generate an access token for a valid user', () => {
    const user = {
      id: 1,
      uuid: 'test-uuid',
      email: 'user@example.com',
      role: 'USER',
      first_name: 'John',
      last_name: 'Doe',
    };
    const jwtSignSpy = jest
      .spyOn(jwt, 'sign')
      .mockReturnValue('mockAccessToken' as any);

    const token = service.generateAccessToken(user as Partial<User>);

    expect(jwtSignSpy).toHaveBeenCalledWith(
      {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      expect.any(Buffer),
      {
        algorithm: 'RS512',
        audience: 'secedge',
        issuer: 'secedge',
        expiresIn: '5m',
      },
    );

    expect(token).toBe('mockAccessToken');
  });
});
