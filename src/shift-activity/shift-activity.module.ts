import { Module } from '@nestjs/common';
import { ShiftActivityService } from './shift-activity.service';
import { ShiftActivityController } from './shift-activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftActivity } from '../entities/shift-activity.entity';

@Module({
  controllers: [ShiftActivityController],
  providers: [ShiftActivityService],
  imports: [TypeOrmModule.forFeature([ShiftActivity])],
})
export class ShiftActivityModule {}
