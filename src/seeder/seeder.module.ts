import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from '../users/entities/site.entity';
import { UserRole } from '../users/entities/user-role.entity';

@Module({
  providers: [SeederService],
  controllers: [SeederController],
  imports: [TypeOrmModule.forFeature([User, Site, UserRole])],
})
export class SeederModule {}
