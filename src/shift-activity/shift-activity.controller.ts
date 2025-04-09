import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ShiftActivityService } from './shift-activity.service';
import { CreateShiftActivityDto } from './dto/create-shift-activity.dto';
import { UpdateShiftActivityDto } from './dto/update-shift-activity.dto';
import { Role } from '../decorators/role.decorator';
import { RoleGuard } from '../auth/guards/role.quard';

@Role('TEAM_LEADER')
@UseGuards(RoleGuard)
@Controller('shift-activity')
export class ShiftActivityController {
  constructor(private readonly shiftActivityService: ShiftActivityService) {}

  @Post()
  create(@Body() createShiftActivityDto: CreateShiftActivityDto) {
    return this.shiftActivityService.create(createShiftActivityDto);
  }

  @Get()
  findAll() {
    return this.shiftActivityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftActivityService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShiftActivityDto: UpdateShiftActivityDto,
  ) {
    return this.shiftActivityService.update(+id, updateShiftActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftActivityService.remove(+id);
  }
}
