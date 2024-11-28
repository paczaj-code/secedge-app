import { Module } from '@nestjs/common';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { Site } from '../entities/site.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseDatabaseService } from '../generic/baseDatabase/baseDatabase.service';

@Module({
  controllers: [SitesController],
  providers: [SitesService, BaseDatabaseService],
  imports: [TypeOrmModule.forFeature([Site])],
})
export class SitesModule {}
