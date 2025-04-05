import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { User } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as fs from 'node:fs';
import { UserRoles } from '../enums/userRoles';
import { JwtService } from '@nestjs/jwt';
import * as process from 'node:process';
import { Site } from '../entities/site.entity';

interface AccessTokenPayload {
  id: number;
  uuid: string;
  email: string;
  role: UserRoles;
  firstName: string;
  lastName: string;
  default_site: Site;
  other_sites?: Site[];
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

  /**
   * Authenticates a user with the provided login credentials.
   * Checks the user's email and password against the stored user data.
   * Throws an exception if the credentials are invalid.
   *
   * @param {LoginDto} credentials - The login credentials, including email and password.
   * @return {Promise<object>} A promise that resolves to the authentication tokens for the user.
   * @throws {HttpException} If the provided email or password is invalid.
   */
  async login(
    credentials: LoginDto,
  ): Promise<{ refreshToken: string; accessToken: string }> {
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

  /**
   * Generates and returns an access token and a refresh token for the specified user.
   *
   * @param {User} user - The user object containing information required to generate the tokens.
   * @return {Promise<{refreshToken: string, accessToken: string}>} A promise resolving to an object containing the generated refresh token and access token.
   */
  async getTokens(
    user: User,
  ): Promise<{ refreshToken: string; accessToken: string }> {
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
      default_site: user.default_site,
      other_sites: user.other_sites.length > 0 ? user.other_sites : undefined,
    };
    const [refreshToken, accessToken] = await Promise.all([
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: process.env.REFRESH_JWT_SECRET,
        expiresIn: '24h',
        algorithm: 'HS512',
      }),
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.privateKey,
        expiresIn: '1h',
        algorithm: 'RS512',
      }),
    ]);

    return {
      refreshToken,
      accessToken,
    };
  }

  /**
   * Attempts to refresh a user's authentication by verifying the provided refresh token.
   *
   * @param {string} refreshToken - The refresh token used to verify and generate new authentication tokens.
   * @return {Promise<Object>} A promise that resolves to a new set of authentication tokens if the refresh token is valid.
   * @throws {HttpException} Throws an exception if the provided refresh token is invalid or verification fails.
   */
  async relogin(refreshToken: string): Promise<object> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_JWT_SECRET,
      });
      if (payload) {
        const user = await this.userService.findOne(payload.uuid);
        return this.getTokens(user);
      }
    } catch (e) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
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
      throw new HttpException('Invalid access token', HttpStatus.UNAUTHORIZED);
    }
  }

  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, password);
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verify(token, { secret: this.publicKey });
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.REFRESH_JWT_SECRET,
    });
  }
}
