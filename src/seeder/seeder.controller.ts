import { Controller, Get, HttpCode } from '@nestjs/common';
import { SeederService } from './seeder.service';

/**
 * Controller responsible for seeding the database.
 *
 * This controller provides an endpoint to seed initial data into the database
 * using the SeederService. It is typically used during development or testing
 * to initialize the database with a predefined set of data.
 */
@Controller('seeder')
export class SeederController {
  constructor(private seederService: SeederService) {}
  @HttpCode(200)
  @Get('')
  seedDatabase() {
    return this.seederService.seedDatabaseData();
  }
}
