import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BaseDatabaseService } from '../generic/baseDatabase/baseDatabase.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from '../entities/site.entity';
import { User } from '../entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, BaseDatabaseService],
  imports: [TypeOrmModule.forFeature([Site, User]), AuthModule],
})
export class UsersModule {}
