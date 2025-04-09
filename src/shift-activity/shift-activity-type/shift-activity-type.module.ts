import { Module } from '@nestjs/common';
import { ShiftActivityTypeService } from './shift-activity-type.service';
import { ShiftActivityTypeController } from './shift-activity-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftActivityType } from '../../entities/shift-activity-type.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  controllers: [ShiftActivityTypeController],
  providers: [ShiftActivityTypeService],
  imports: [TypeOrmModule.forFeature([ShiftActivityType]), AuthModule],
})
export class ShiftActivityTypeModule {}
