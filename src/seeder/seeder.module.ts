import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { FakeUserService } from './services/fake.user.service';

/**
 * SeederModule is responsible for setting up the services and controller
 * related to database seeding. It includes providers for SeederService and
 * FakeUserService, as well as the SeederController.
 *
 * The SeederService handles the logic for seeding the database with fake or
 * initial data, while the FakeUserService provides the necessary methods to
 * create and manage fake user data.
 *
 * The SeederController exposes endpoints to trigger the seeding process.
 *
 * It is intended to be used as part of the application's module system.
 */
@Module({
  providers: [SeederService, FakeUserService],
  controllers: [SeederController],
})
export class SeederModule {}
