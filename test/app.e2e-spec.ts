import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { FakeUserService } from '../src/seeder/services/fake.user.service';
import { User } from '../src/entities/user.entity';
import { Connection, EntityManager } from 'typeorm';
import ormConfig from '../src/config/orm.config';
import { DataSource } from 'typeorm';
import { Site } from '../src/entities/site.entity';
import { fakeSites } from '../src/seeder/services/fake.site';
import { SeederService } from '../src/seeder/seeder.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let em: EntityManager;
  let ss: SeederService;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    em = app.get(EntityManager);
    ss = app.get(SeederService);
    const fakeUserService = new FakeUserService();
    const users = await fakeUserService.generateFakeUsers(22);
    // console.log(users);
    await em.insert(Site, fakeSites);
    await em.insert(User, users);
  });

  afterAll(async () => {
    await ss.truncateTables();
  });

  // beforeEach(async () => {});

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/api').expect(404);
    // .expect({ message: 'Hello secedge-app' });
  });
  // it('/ (GET2)', async () => {
  //   const result = await request(app.getHttpServer()).get('/api/2');
  //   expect(result.status).toBe(200);
  //   expect(result.body.message).toEqual('message');
  // });
});
