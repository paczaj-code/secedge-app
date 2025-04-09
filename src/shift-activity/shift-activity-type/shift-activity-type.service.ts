import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUpdateShiftActivityTypeDto } from './dto/create-update-shift-activity-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftActivityType } from '../../entities/shift-activity-type.entity';
import { User } from '../../entities/user.entity';
import { UsersService } from '../../users/users.service';
import { FindOneShiftActivityTypeDto } from './dto/find-one-shift-activity-type.dto';
import { FindOAllShiftActivityTypeDto } from './dto/find-all-shift-activity-type.dto';

/**
 * Service for managing shift activity types, which includes creating, retrieving,
 * updating, and removing shift activity types and their associated data.
 */
@Injectable()
export class ShiftActivityTypeService {
  constructor(
    @InjectRepository(ShiftActivityType)
    private readonly shiftActivityTypeRepository: Repository<ShiftActivityType>,
    private readonly userService: UsersService,
  ) {}

  /**
   * Creates and saves a new ShiftActivityType entity in the database.
   *
   * @param {CreateUpdateShiftActivityTypeDto} createShiftActivityTypeDto - The data transfer object containing the details for creating a new ShiftActivityType.
   * @param {number} creatorId - The ID of the user who is creating the ShiftActivityType.
   * @return {Promise<ShiftActivityType>} A promise that resolves to the newly created ShiftActivityType entity.
   */
  async create(
    createShiftActivityTypeDto: CreateUpdateShiftActivityTypeDto,
    creatorId: number,
  ): Promise<ShiftActivityType> {
    // Pobierz użytkownika na podstawie ID kreatora.
    const creator: User = await this.userService.findUserById(creatorId);

    const newShiftActivityType = this.shiftActivityTypeRepository.create({
      ...createShiftActivityTypeDto,
      created_by: creator,
    });
    return await this.shiftActivityTypeRepository.save(newShiftActivityType);
  }

  /**
   * Retrieves all shift activity types along with the count of associated shift activities.
   *
   * Executes a database query to fetch shift activity types and their related information,
   * including the count of associated shift activities. Returns the result of the query
   * or throws an HttpException in case of an error.
   *
   * @return {Promise<FindOAllShiftActivityTypeDto | HttpException>} A promise that resolves
   * with a data transfer object containing the shift activity types and their associated
   * shift activity count, or rejects with an HttpException in case of an error.
   */
  async findAll(): Promise<FindOAllShiftActivityTypeDto[] | HttpException> {
    try {
      return await this.shiftActivityTypeRepository
        .createQueryBuilder('shift_activity_type')
        .select([
          'COUNT(shift_activity.id)::int AS count',
          'shift_activity_type.name as name',
          'shift_activity_type.id  as id',
          'shift_activity_type.uuid as uuid',
        ])
        .leftJoin(
          'shift_activity',
          'shift_activity',
          'shift_activity.typeId = shift_activity_type.id',
        )
        .groupBy('shift_activity_type.name')
        .addGroupBy('shift_activity_type.id')
        .orderBy('shift_activity_type.id')
        .getRawMany();
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve shift activity types: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Finds and retrieves a shift activity type based on the provided UUID.
   *
   * @param {string} uuid - The unique identifier of the shift activity type to retrieve.
   * @return {Promise<FindOneShiftActivityTypeDto | HttpException>} Returns the retrieved shift activity type object if found,
   * or an HttpException if an error occurs or the shift activity type is not found.
   */
  async findOne(
    uuid: string,
  ): Promise<FindOneShiftActivityTypeDto | HttpException> {
    try {
      const shiftActivityType = await this.findShiftActivityTypeByUuid(uuid);

      if (!shiftActivityType) {
        throw new HttpException('Shift activity type not found', 404);
      }

      return shiftActivityType;
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve shift activity types: ${error.message}`,
        error.status ? error.status : HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Aktualizuje typ aktywności zmiany o podanym identyfikatorze UUID
   *
   * @param uuid Identyfikator UUID typu aktywności do aktualizacji
   * @param updateDto Dane do aktualizacji typu aktywności
   * @returns Zaktualizowany typ aktywności
   * @throws HttpException gdy typ aktywności nie zostanie znaleziony lub wystąpi błąd aktualizacji
   */
  async update(
    uuid: string,
    updateDto: CreateUpdateShiftActivityTypeDto,
  ): Promise<ShiftActivityType | HttpException> {
    try {
      const existingActivityType = await this.findShiftActivityTypeByUuid(uuid);

      const updatedActivityType = this.shiftActivityTypeRepository.merge(
        existingActivityType,
        updateDto,
      );

      return await this.shiftActivityTypeRepository.save(updatedActivityType);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to update shift activity types: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Removes a shift activity type identified by the provided UUID if it is not assigned to any shift activities.
   *
   * @param {string} uuid - The UUID of the shift activity type to be removed.
   * @return {Promise<object>} A promise resolving to the result of the delete operation.
   * @throws {HttpException} Throws an exception if the shift activity type is assigned to any shift activities.
   */
  async remove(
    uuid: string,
  ): Promise<{ raw: any[]; affected?: number } | HttpException> {
    const shiftActivityType = await this.findShiftActivityTypeByUuid(uuid);
    if (shiftActivityType.activities.length > 0) {
      throw new HttpException(
        'Cannot delete shift activity type because is assigned to some shift activities',
        HttpStatus.CONFLICT,
      );
    }
    return await this.shiftActivityTypeRepository.delete({ uuid });
  }

  /**
   * Retrieves a shift activity type based on its UUID.
   *
   * @param {string} typeUuid - The unique identifier of the shift activity type to fetch.
   * @return {Promise<ShiftActivityType>} A promise that resolves to the shift activity type,
   * or throws an exception if not found or an error occurs during retrieval.
   */
  private async findShiftActivityTypeByUuid(
    typeUuid: string,
  ): Promise<ShiftActivityType> {
    // Selected columns for the query
    const SELECT_COLUMNS = [
      // ShiftActivityType columns
      'shiftActivityType.name',
      'shiftActivityType.id',
      'shiftActivityType.uuid',
      'shiftActivityType.description',
      'shiftActivityType.created_at',
      'shiftActivityType.updated_at',
      'shiftActivityType.created_by',

      // ShiftActivity columns
      'shiftActivity.id',
      'shiftActivity.uuid',
      'shiftActivity.name',

      // Creator columns
      'created_by.uuid',
      'created_by.first_name',
      'created_by.last_name',
    ];

    try {
      return await this.shiftActivityTypeRepository
        .createQueryBuilder('shiftActivityType')
        .leftJoinAndSelect('shiftActivityType.activities', 'shiftActivity')
        .leftJoinAndSelect('shiftActivityType.created_by', 'created_by')
        .select(SELECT_COLUMNS)
        .where('shiftActivityType.uuid = :typeUuid', { typeUuid })
        .orderBy('shiftActivityType.id', 'ASC')
        .getOne();
    } catch (error) {
      const errorMessage = `Failed to retrieve shift activity type with UUID ${typeUuid}: ${error.message}`;
      Logger.error(errorMessage, 'ShiftActivityTypeService');
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
