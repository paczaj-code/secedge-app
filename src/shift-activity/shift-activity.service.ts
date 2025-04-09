import { HttpException, Injectable } from '@nestjs/common';
import { ShiftActivityType } from '../entities/shift-activity-type.entity';
import { CreateShiftActivityDto } from './dto/create-shift-activity.dto';
import { UpdateShiftActivityDto } from './dto/update-shift-activity.dto';
import { ShiftActivity } from '../entities/shift-activity.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindAllActivitiesDto } from './dto/find-all-activities.dto';

@Injectable()
export class ShiftActivityService {
  constructor(
    @InjectRepository(ShiftActivity)
    private readonly shiftActivityRepository: Repository<ShiftActivity>,
  ) {}

  private readonly activityTypeRepository: Repository<ShiftActivityType> =
    this.shiftActivityRepository.manager.getRepository(ShiftActivityType);

  create(createShiftActivityDto: CreateShiftActivityDto) {
    return 'This action adds a new shiftActivity';
  }

  /**
   * Fetches all activities and activity types from the database.
   *
   * @return {Promise<FindAllActivitiesDto[] | HttpException>} A promise resolving to an array of FindAllActivitiesDto objects containing activities and activity types, or an HttpException in case of failure.
   */
  async findAll(): Promise<FindAllActivitiesDto[] | HttpException> {
    const result = await this.shiftActivityRepository.query(
      `WITH activity_types AS (SELECT shift_activity_type.name, shift_activity_type.uuid
                        FROM shift_activity_type
                        ORDER BY shift_activity_type.id),
     activities AS (SELECT shift_activity.name,
                           shift_activity.uuid,
                           shift_activity_type.name AS type_name
                    FROM shift_activity
                             JOIN shift_activity_type ON shift_activity."typeId" = shift_activity_type.id
                    ORDER BY shift_activity_type.name, shift_activity.name)
SELECT (SELECT JSON_AGG(activity_types.*) FROM activity_types) as activity_types,
       (SELECT JSON_AGG(activities.*) FROM activities)         as activities
       LIMIT 1;
       `,
    );
    return result[0];
  }

  findOne(uuid: string): Promise<ShiftActivity> {
    try {
      return this.shiftActivityRepository
        .createQueryBuilder()
        .leftJoinAndSelect('ShiftActivity.type', 'type')
        .where('ShiftActivity.uuid = :uuid', { uuid: uuid })
        .select(['ShiftActivity', 'type.name'])
        .getOne();
    } catch (error) {
      throw new HttpException(`Activity with uuid ${uuid} not found`, 404);
    }
  }

  update(id: number, updateShiftActivityDto: UpdateShiftActivityDto) {
    return `This action updates a #${id} shiftActivity`;
  }

  remove(id: number) {
    return `This action removes a #${id} shiftActivity`;
  }
}
