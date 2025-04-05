import * as request from 'supertest';
import { DataSource, DataSourceOptions } from 'typeorm';
import ormConfig from '../src/config/orm.config';

const dataSource = new DataSource(ormConfig() as DataSourceOptions);

describe('AppController (e2e)', () => {
  beforeAll(async () => {
    await dataSource.initialize();
  });
  afterAll(async () => {
    await dataSource.destroy();
  });

  it('/ (GET all sites)', async () => {
    const allSites = await dataSource.manager.query(
      'SELECT * FROM sites ORDER BY name ',
    );

    const response = await request(globalThis.APP.getHttpServer()).get(
      '/sites',
    );

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
    expect(response.body[0].name).toBe('WAW01');
    expect(response.body[0].uuid).toBeDefined();
    expect(response.body[0].name).toEqual(allSites[0].name);
    expect(response.body[0].uuid).toEqual(allSites[0].uuid);
  });

  describe('some', () => {
    it('/ (GET2)', async () => {
      const result = await request(globalThis.APP.getHttpServer()).get(
        '/api/2',
      );
      expect(result.status).toBe(404);
    });
  });
});
