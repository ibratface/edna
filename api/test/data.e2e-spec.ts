import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createReadStream, readFileSync, statSync } from "fs";
import * as crypto from 'crypto';
import { DataDto } from 'src/dataset/dataset.dto';


const REGEXP_URL = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
const TEST_FILEPATH = 'test/data/edna.webp'


describe('DatasetController (e2e)', () => {
  let app: INestApplication
  const datasetId: string = 'test.data.e2e'
  let dataId: string = null
  const label = {
    'a': 'b',
    'c': 'd'
  }


  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/dataset')
      .send({ name: datasetId })
      .expect(201)
  })

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete(`/dataset/${datasetId}`)
      .expect(200)
  })

  describe('/dataset/:datasetId/data (GET)', () => {
    it('should return empty', async () => {
      const res = await request(app.getHttpServer())
        .get(`/dataset/${datasetId}/data`)
        .set('Accept', 'application/json')
      expect(res.body.entries?.length).toBe(0)
    })
  })

  describe('/dataset/:datasetId/data (POST)', () => {
    let postres;

    it('should return a valid upload url and key', async () => {
      jest.setTimeout(20000)

      // request a key and presigned url
      postres = await request(app.getHttpServer())
        .post(`/dataset/${datasetId}/data`)
        .send()
        .set('Accept', 'application/json')
        .expect(201)
      expect(postres.body).toStrictEqual<DataDto>(expect.objectContaining({
        key: expect.any(String),
        uploadUrl: expect.stringMatching(REGEXP_URL)
      }))
    })

    it('should allow uploading of the test file with the url', async () => {
      // actually upload a file
      const payload = createReadStream(TEST_FILEPATH);
      const putres = await request(postres.body.uploadUrl)
        .put('/')
        .set('Content-Length', String(statSync(TEST_FILEPATH).size))
        .attach('file', payload)
      expect(putres.status).toBe(200)

      // save the dataId
      dataId = postres.body.key
    })
  })

  describe('/dataset/:datasetId/data/:dataId (OPTIONS)', () => {
    let getres;

    it('should return a valid download url and key', async () => {
      jest.setTimeout(20000)

      // request a key and presigned url
      getres = await request(app.getHttpServer())
        .get(`/dataset/${datasetId}/data/${dataId}`)
        .set('Accept', 'application/json')
        .expect(200)

      expect(getres.body).toStrictEqual(expect.objectContaining({
        uploadUrl: expect.stringMatching(REGEXP_URL),
        downloadUrl: expect.stringMatching(REGEXP_URL)
      }))
    })

    it('should allow downloading of the test file with the url', async () => {
      // actually download the file

      // buffer file in res.body
      const dlres = await request(getres.body.uploadUrl)
        .get('/')
        .buffer()
        .parse((res, callback) => {
          res.setEncoding('binary');
          let data = ''
          res.on('data', (chunk) => {
            data += chunk;
          })
          res.on('end', () => {
            callback(null, Buffer.from(data, 'binary'));
          })
        })

      expect(dlres.status).toBe(200)

      // hash must be equal for what we uploaded
      const originalFile = readFileSync(TEST_FILEPATH);
      const originalHash = crypto.createHash('md5').update(originalFile).digest('hex')
      const downloadedHash = crypto.createHash('md5').update(dlres.body).digest('hex')
      expect(downloadedHash).toEqual(originalHash)
    })
  })

  describe('/dataset/:datasetId/data/:dataId/label', () => {
    it('(POST) should return success', async () => {
      return request(app.getHttpServer())
        .post(`/dataset/${datasetId}/data/${dataId}/label`)
        .send(label)
        .expect(201)
    })

    it('(GET) should return the same label we applied', async () => {
      const res = await request(app.getHttpServer())
        .get(`/dataset/${datasetId}/data/${dataId}/label`)
        .expect(200)
      expect(res.body).toStrictEqual(label)
    })

    it('(DELETE) should return success', () => {
      return request(app.getHttpServer())
        .delete(`/dataset/${datasetId}/data/${dataId}/label`)
        .expect(200)
    })

    it('(GET) should return empty', async () => {
      const res = await request(app.getHttpServer())
        .get(`/dataset/${datasetId}/data/${dataId}/label`)
        .expect(200)
      expect(res.body).toStrictEqual({})
    })
  })

  describe('/dataset/:datasetId/data/:dataId (DELETE)', () => {
    it('should delete the test file', () => {
      return request(app.getHttpServer())
        .delete(`/dataset/${datasetId}/data/${dataId}`)
        .expect(200)
    })
  })

});
