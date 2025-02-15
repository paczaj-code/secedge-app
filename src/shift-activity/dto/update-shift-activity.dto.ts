import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftActivityDto } from './create-shift-activity.dto';

export class UpdateShiftActivityDto extends PartialType(CreateShiftActivityDto) {}
