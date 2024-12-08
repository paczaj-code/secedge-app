import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findUserByEmail: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('getTokens', () => {
    it('should return access and refresh tokens', async () => {
      const user = {
        id: 1,
        uuid: 'uuid',
        email: 'test@example.com',
        role: 'USER',
        first_name: 'John',
        last_name: 'Doe',
      } as unknown as User;

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mockToken');

      const tokens = await authService.getTokens(user);

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(tokens).toEqual({
        refreshToken: 'mockToken',
        accessToken: 'mockToken',
      });
    });
  });
  describe('login', () => {
    it('should successfully log in the user and return tokens', async () => {
      const credentials: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = {
        id: 1,
        uuid: 'uuid',
        email: 'test@example.com',
        hashed_password: 'hashedPassword',
      };

      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(user as User);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      const tokens = await authService.login(credentials);

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(tokens).toEqual({ refreshToken: 'token', accessToken: 'token' });
    });

    it('should throw an error if user is not found', async () => {
      const credentials: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password',
      };
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);

      await expect(authService.login(credentials)).rejects.toThrow(
        new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw an error if password is incorrect', async () => {
      const credentials: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const user = {
        id: 1,
        uuid: 'uuid',
        email: 'test@example.com',
        hashed_password: 'hashedPassword',
      };

      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(user as User);
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      await expect(authService.login(credentials)).rejects.toThrow(
        new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should return decoded payload for a valid token', () => {
      const validToken = 'validToken';
      const decodedPayload = { id: 1, uuid: 'uuid' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedPayload);

      const result = authService.verifyAccessToken(validToken);

      expect(result).toEqual(decodedPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(validToken, {
        secret: authService['privateKey'],
      });
    });

    it('should throw an error for an invalid token', () => {
      const invalidToken = 'invalidToken';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new UnauthorizedException();
      });

      expect(() => authService.verifyAccessToken(invalidToken)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return decoded payload for a valid refresh token', () => {
      const validRefreshToken = 'validRefreshToken';
      const decodedPayload = { id: 1, uuid: 'uuid' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedPayload);

      const result = authService.verifyRefreshToken(validRefreshToken);

      expect(result).toEqual(decodedPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(validRefreshToken, {
        secret: process.env.REFRESH_JWT_SECRET,
      });
    });

    it('should throw an error for an invalid refresh token', () => {
      const invalidRefreshToken = 'invalidRefreshToken';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new UnauthorizedException();
      });

      expect(() => authService.verifyRefreshToken(invalidRefreshToken)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access and refresh tokens if refresh token is valid and less than 2 hours to expire', async () => {
      const validRefreshToken = 'validRefreshToken';
      const payload = {
        id: 1,
        uuid: 'uuid',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const user = {
        id: 1,
        uuid: 'uuid',
        email: 'test@example.com',
        role: 'USER',
        first_name: 'John',
        last_name: 'Doe',
      } as unknown as User;

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(authService, 'getTokens').mockResolvedValue({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });

      const result = await authService.refreshAccessToken(validRefreshToken);

      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
    });

    it('should retain the old refresh token if it is valid and more than 2 hours to expire', async () => {
      const validRefreshToken = 'validRefreshToken';
      const payload = {
        id: 1,
        uuid: 'uuid',
        exp: Math.floor(Date.now() / 1000) + 10800,
      };
      const user = {
        id: 1,
        uuid: 'uuid',
        email: 'test@example.com',
        role: 'USER',
        first_name: 'John',
        last_name: 'Doe',
      } as unknown as User;

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(authService, 'getTokens').mockResolvedValue({
        accessToken: 'newAccessToken',
        refreshToken: validRefreshToken,
      });

      const result = await authService.refreshAccessToken(validRefreshToken);

      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: validRefreshToken,
      });
    });

    it('should throw HttpException for an invalid refresh token', async () => {
      const invalidRefreshToken = 'invalidRefreshToken';

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(
        authService.refreshAccessToken(invalidRefreshToken),
      ).rejects.toThrow(
        new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED),
      );
    });
  });
});
