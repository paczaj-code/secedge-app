import { Injectable } from '@nestjs/common';
import { CreateShiftActivityDto } from './dto/create-shift-activity.dto';
import { UpdateShiftActivityDto } from './dto/update-shift-activity.dto';
import { ShiftActivity } from '../entities/shift-activity.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ShiftActivityService {
  constructor(
    @InjectRepository(ShiftActivity)
    private readonly shiftActivityRepository: Repository<ShiftActivity>,
  ) {}

  create(createShiftActivityDto: CreateShiftActivityDto) {
    return 'This action adds a new shiftActivity';
  }

  findAll() {
    return this.shiftActivityRepository.find();
  }

  findOne(uuid: string) {
    return;
  }

  update(id: number, updateShiftActivityDto: UpdateShiftActivityDto) {
    return `This action updates a #${id} shiftActivity`;
  }

  remove(id: number) {
    return `This action removes a #${id} shiftActivity`;
  }
}
