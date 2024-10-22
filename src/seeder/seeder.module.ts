import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { FakeUserService } from './services/fake.user.service';

@Module({
  providers: [SeederService, FakeUserService],
  controllers: [SeederController],
})
export class SeederModule {}
