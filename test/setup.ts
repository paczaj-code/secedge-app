import { FakeUserService } from '../src/seeder/services/fake.user.service';
import { EntityManager } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { SeederService } from '../src/seeder/seeder.service';
import { Site } from '../src/entities/site.entity';
import { fakeSites } from '../src/seeder/services/fake.site';
import { INestApplication } from '@nestjs/common';

module.exports = async (
  _: any,
  projectConfig: { globals: { APP_PORT: string | number } },
) => {
  let app: INestApplication;
  let entityManager: EntityManager;
  let seederService: SeederService;
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
  await app.listen(projectConfig.globals.APP_PORT);
  globalThis.APP = app;
  entityManager = globalThis.APP.get(EntityManager);
  seederService = globalThis.APP.get(SeederService);
  const fakeUserService = new FakeUserService();
  const users = await fakeUserService.generateFakeUsers(22);
  await seederService.truncateTables();
  await entityManager.insert(Site, fakeSites);
  await entityManager.insert(User, users);
};
