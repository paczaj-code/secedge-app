import { Module } from '@nestjs/common';
import { ShiftActivityService } from './shift-activity.service';
import { ShiftActivityController } from './shift-activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftActivity } from '../entities/shift-activity.entity';
import { ShiftActivityTypeModule } from './shift-activity-type/shift-activity-type.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ShiftActivityController],
  providers: [ShiftActivityService],
  imports: [
    TypeOrmModule.forFeature([ShiftActivity]),
    ShiftActivityTypeModule,
    AuthModule,
  ],
})
export class ShiftActivityModule {}
