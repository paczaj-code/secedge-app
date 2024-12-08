import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { User } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as fs from 'node:fs';
import { UserRoles } from '../enums/userRoles';
import { JwtService } from '@nestjs/jwt';
import * as process from 'node:process';

interface AccessTokenPayload {
  id: number;
  uuid: string;
  email: string;
  role: UserRoles;
  firstName: string;
  lastName: string;
}

interface RefreshTokenPayload {
  id: number;
  uuid: string;
}

/**
 * AuthService is responsible for handling user authentication and token management operations.
 * It provides methods for user login, token generation, verification, and refreshing access tokens.
 */
@Injectable()
export class AuthService {
  private readonly privateKey: Buffer;
  private readonly publicKey: Buffer;

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {
    this.privateKey = fs.readFileSync('private.key');
    this.publicKey = fs.readFileSync('public.pem');
  }

  async login(credentials: LoginDto) {
    const user = await this.userService.findUserByEmail(credentials.email);
    if (
      !user ||
      !(await this.verifyPassword(credentials.password, user.hashed_password))
    ) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.getTokens(user);
  }

  async getTokens(user: User) {
    const refreshTokenPayload: RefreshTokenPayload = {
      id: user.id,
      uuid: user.uuid,
    };
    const accessTokenPayload: AccessTokenPayload = {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
    };
    const [refreshToken, accessToken] = await Promise.all([
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: process.env.REFRESH_JWT_SECRET,
        expiresIn: '24h',
        algorithm: 'HS512',
      }),
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.privateKey,
        expiresIn: '5m',
        algorithm: 'RS512',
      }),
    ]);

    return {
      refreshToken,
      accessToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_JWT_SECRET,
      });

      const now = Date.now() / 1000;
      const user = await this.userService.findOne(payload.uuid);
      const newTokens = await this.getTokens(user);

      if ((payload.exp - now) / 3600 > 2) {
        newTokens.refreshToken = refreshToken;
      }

      return newTokens;
    } catch (e) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
  }

  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, password);
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verify(token, { secret: this.privateKey });
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.REFRESH_JWT_SECRET,
    });
  }
}
