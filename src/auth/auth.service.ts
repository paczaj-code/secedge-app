import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { User } from '../entities/user.entity';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as fs from 'node:fs';
import { UserRoles } from '../enums/userRoles';

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

@Injectable()
export class AuthService {
  private readonly privateKey: Buffer;
  private readonly publicKey: Buffer;

  constructor(private userService: UsersService) {
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

    return {
      refreshToken: this.generateRefreshToken(user),
      accessToken: this.generateAccessToken(user),
    };
  }

  private buildAccessTokenPayload(user: Partial<User>): AccessTokenPayload {
    return {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
    };
  }

  private buildRefreshTokenPayload(
    user: Pick<User, 'uuid' | 'id'>,
  ): RefreshTokenPayload {
    return { id: user.id, uuid: user.uuid };
  }

  generateRefreshToken(user: Pick<User, 'uuid' | 'id'>) {
    const payload = this.buildRefreshTokenPayload(user);
    const secret = process.env.REFRESH_JWT_SECRET;
    return jwt.sign(payload, secret, {
      algorithm: 'HS512',
      audience: 'secedge',
      issuer: 'secedge',
      expiresIn: '13h',
    });
  }

  generateAccessToken(user: Partial<User>) {
    const payload = this.buildAccessTokenPayload(user);
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS512',
      audience: 'secedge',
      issuer: 'secedge',
      expiresIn: '5m',
    });
  }

  validateAccessToken(token: string) {
    return jwt.verify(token, this.publicKey, {});
  }

  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, password);
  }
}
