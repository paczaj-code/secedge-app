import { Controller, Get, HttpCode } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('seeder')
export class SeederController {
  constructor(private seederService: SeederService) {}
  @HttpCode(200)
  @Get('')
  seedDatabase() {
    return this.seederService.seedDatabaseData();
  }
}
