import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  HttpException,
  Req,
} from '@nestjs/common';
import { ShiftActivityTypeService } from './shift-activity-type.service';
import { CreateUpdateShiftActivityTypeDto } from './dto/create-update-shift-activity-type.dto';
import { Role } from '../../decorators/role.decorator';
import { RoleGuard } from '../../auth/guards/role.quard';
import { UuidValidationPipePipe } from '../../pipes/uuid-validation-pipe/uuid-validation-pipe.pipe';
import { UserRoles } from '../../enums/userRoles';
import { Site } from '../../entities/site.entity';
import { DeepPartial } from 'typeorm';
import { FindOneShiftActivityTypeDto } from './dto/find-one-shift-activity-type.dto';
import { ShiftActivityType } from '../../entities/shift-activity-type.entity';
import { FindOAllShiftActivityTypeDto } from './dto/find-all-shift-activity-type.dto';

interface CustomRequest extends Request {
  user: {
    id: number;
    uuid: string;
    email: string;
    role: UserRoles;
    firstName: string;
    lastName: string;
    default_site: DeepPartial<Site>;
    other_sites: Partial<Site>[] | null;
    iat: number;
    exp: number;
  };
}

/**
 * Controller for managing shift activity types.
 * Handles operations such as creating, retrieving, updating, and deleting shift activity types.
 *
 * This controller is protected by the RoleGuard and accessible only to users with the TEAM_LEADER role.
 */
@Role('TEAM_LEADER')
@UseGuards(RoleGuard)
@Controller('shift-activity-type')
export class ShiftActivityTypeController {
  constructor(
    private readonly shiftActivityTypeService: ShiftActivityTypeService,
  ) {}

  /**
   * Creates a new ShiftActivityType entity using the provided data and the user ID from the request.
   *
   * @param {CustomRequest} request - The HTTP request object containing the user information.
   * @param {CreateUpdateShiftActivityTypeDto} createShiftActivityTypeDto - The DTO containing the data required to create a new ShiftActivityType entity.
   * @return {Promise<ShiftActivityType | HttpException>} A promise that resolves to the created ShiftActivityType entity or an HttpException in case of an error.
   */
  @Post()
  create(
    @Req() request: CustomRequest,
    @Body() createShiftActivityTypeDto: CreateUpdateShiftActivityTypeDto,
  ): Promise<ShiftActivityType | HttpException> {
    return this.shiftActivityTypeService.create(
      createShiftActivityTypeDto,
      request.user.id,
    );
  }

  /**
   * Retrieves all shift activity type records.
   *
   * @return {Promise<FindOAllShiftActivityTypeDto[] | HttpException>} A promise that resolves with an array of shift activity type DTOs or rejects with an HTTP exception.
   */
  @Get()
  findAll(): Promise<FindOAllShiftActivityTypeDto[] | HttpException> {
    return this.shiftActivityTypeService.findAll();
  }

  /**
   * Retrieves a specific shift activity type by its UUID.
   *
   * @param {string} uuid - The unique identifier of the shift activity type.
   * @return {Promise<FindOneShiftActivityTypeDto | HttpException>} A promise that resolves to the shift activity type details or an HTTP exception if not found.
   */
  @Get(':uuid')
  findOne(
    @Param('uuid', new UuidValidationPipePipe()) uuid: string,
  ): Promise<FindOneShiftActivityTypeDto | HttpException> {
    return this.shiftActivityTypeService.findOne(uuid);
  }

  /**
   * Updates the shift activity type based on the provided UUID and update data.
   *
   * @param {string} uuid - The unique identifier of the shift activity type to update.
   * @param {CreateUpdateShiftActivityTypeDto} updateShiftActivityTypeDto - The updated data for the shift activity type.
   * @return {Promise<any>} A promise that resolves to the updated shift activity type data.
   */
  @Put(':uuid')
  update(
    @Param('uuid', new UuidValidationPipePipe()) uuid: string,
    @Body() updateShiftActivityTypeDto: CreateUpdateShiftActivityTypeDto,
  ): Promise<ShiftActivityType | HttpException> {
    return this.shiftActivityTypeService.update(
      uuid,
      updateShiftActivityTypeDto,
    );
  }

  /**
   * Removes an entity identified by the given UUID
   * from the shift activity type service.
   *
   * @param {string} uuid - The unique identifier of the entity to be removed.
   * @return {Promise<{ raw: any[]; affected: number }>} The result of the removal operation from the service.
   */
  @Delete(':uuid')
  remove(
    @Param('uuid', new UuidValidationPipePipe()) uuid: string,
  ): Promise<{ raw: any[]; affected?: number } | HttpException> {
    return this.shiftActivityTypeService.remove(uuid);
  }
}
