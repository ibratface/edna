import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('DatasetController (e2e)', () => {
  let app: INestApplication;
  const datasetId: string = 'test.dataset.e2e'

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/dataset (POST)', () => {
    it('should return 201', () => {
      return request(app.getHttpServer())
        .post('/dataset')
        .send({ name: datasetId })
        .expect(201)
    })
  })

  describe('/dataset (GET)', () => {
    it('should return a non-empty array with the created dataset', async () => {
      const res = await request(app.getHttpServer())
        .get(`/dataset`)
        .set('Accept', 'application/json')

      expect(res.status).toBe(200)
      expect(res.body.length).toBeGreaterThan(0)
      expect(res.body).toContainEqual(expect.objectContaining({ name: datasetId }))
    })
  })

  describe('/dataset/:datasetId (DELETE)', () => {
    it('should return 200', () => {
      return request(app.getHttpServer())
        .delete(`/dataset/${datasetId}`)
        .expect(200)
    })
  })

})
