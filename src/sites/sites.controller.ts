import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  HttpException,
} from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { Site } from '../entities/site.entity';
import { UuidValidationPipePipe } from '../pipes/uuid-validation-pipe/uuid-validation-pipe.pipe';

/**
 * SitesController handles all incoming HTTP requests related to site resources.
 */
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  /**
   * Creates a new site.
   *
   * @param {CreateSiteDto} createSiteDto - The data transfer object containing the details of the site to be created.
   * @return {Promise<Site>} A promise that resolves to the created Site object.
   */
  @Post()
  async create(@Body() createSiteDto: CreateSiteDto): Promise<Site> {
    return await this.sitesService.create(createSiteDto);
  }

  /**
   * Retrieves all items from the sites service.
   *
   * @return {Promise<Site[]>} A promise that resolves to an array of items.
   */
  @Get()
  async findAll(): Promise<Site[]> {
    return await this.sitesService.findAll();
  }

  /**
   * Retrieves a single site based on the provided UUID.
   *
   * @param {string} uuid - The unique identifier of the site to be retrieved.
   * @return {Promise<Site | HttpException>} - A promise that resolves to the site object if found.
   */
  @Get(':uuid')
  async findOne(
    @Param('uuid', new UuidValidationPipePipe()) uuid: string,
  ): Promise<Site | HttpException> {
    return await this.sitesService.findOne(uuid);
  }

  /**
   * Updates the site information with the specified UUID using the provided data.
   *
   * @param {string} uuid - The unique identifier of the site to be updated.
   * @param {UpdateSiteDto} updateSiteDto - The data transfer object containing the updated site information.
   *
   * @return {Promise<Site>} - A promise that resolves to the updated site information.
   */
  @Put(':uuid')
  async update(
    @Param('uuid', new UuidValidationPipePipe()) uuid: string,
    @Body() updateSiteDto: UpdateSiteDto,
  ): Promise<Site> {
    return await this.sitesService.update(uuid, updateSiteDto);
  }
}
