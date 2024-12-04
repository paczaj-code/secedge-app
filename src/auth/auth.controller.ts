import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { th } from '@faker-js/faker';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() credentials: LoginDto) {
    // @ts-ignore

    // try {
    return this.authService.login(credentials);
    // } catch (e) {
    //   throw new HttpException(
    //     'Invalid email or password',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
  }
}
