import { Module } from '@nestjs/common';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { Site } from '../entities/site.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseDatabaseService } from '../generic/baseDatabase/baseDatabase.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [SitesController],
  providers: [SitesService, BaseDatabaseService],
  imports: [TypeOrmModule.forFeature([Site]), AuthModule],
})
export class SitesModule {}
