import { Module } from '@nestjs/common';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { Site } from '../entities/site.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [SitesController],
  providers: [SitesService],
  imports: [TypeOrmModule.forFeature([Site])],
})
export class SitesModule {}
