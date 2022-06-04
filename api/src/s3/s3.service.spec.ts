import { PutObjectTaggingCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { S3Bucket, S3ListObjectsResponse, S3Object } from './s3.interface';
import { S3Service } from './s3.service';


jest.mock('@aws-sdk/client-s3')
jest.mock('@aws-sdk/s3-request-presigner')


describe('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service, ConfigService],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Buckets

  describe('createBucket', () => {
    it('should not throw an error', async () => {
      jest.spyOn(S3Client.prototype, 'send').mockImplementation(() => Promise.resolve(test))
      expect(service.createBucket(null)).resolves.not.toThrow()
    })
  })

  describe('deleteBucket', () => {
    it('should not throw an error', async () => {
      jest.spyOn(S3Client.prototype, 'send').mockImplementation(() => Promise.resolve({}))
      expect(service.deleteBucket(null)).resolves.not.toThrow()
    })
  })

  describe('headBucket', () => {
    it('should not throw an error', async () => {
      jest.spyOn(S3Client.prototype, 'send').mockImplementation(() => Promise.resolve({}))
      expect(service.headBucket(null)).resolves.toBe(true);
    })
  })

  describe('listBuckets', () => {
    it('should return a list of buckets', async () => {
      const result: S3Bucket = {
        createdOn: new Date(),
        name: 'test'
      }
      jest.spyOn(S3Client.prototype, 'send').mockImplementation(() => Promise.resolve({
        Buckets: [{
          CreationDate: result.createdOn,
          Name: result.name
        }]
      }))
      expect(service.listBuckets()).resolves.toStrictEqual([result])
    })
  })

  describe('listBuckets', () => {
    it('should always return an array', async () => {
      jest.spyOn(S3Client.prototype, 'send').mockImplementation(() => Promise.resolve(null))
      expect(service.listBuckets()).resolves.toMatchObject([])
    })
  })

  // Objects

  describe('getSignedUrlGetObject', () => {
    it('should not throw an error', async () => {
      const resultUrl = 'test';
      (getSignedUrl as jest.Mock).mockImplementation(() => Promise.resolve(resultUrl))
      expect(service.getSignedUrlGetObject(null, null)).resolves.toBe(resultUrl)
    })
  })

  describe('getSignedUrlPutObject', () => {
    it('should not throw an error', async () => {
      const resultUrl = 'test';
      (getSignedUrl as jest.Mock).mockImplementation(() => Promise.resolve(resultUrl))
      expect(service.getSignedUrlPutObject(null, null)).resolves.toBe(resultUrl)
    })
  })

  describe('deleteObject', () => {
    it('should not throw an error', async () => {
      jest.spyOn(S3Client.prototype, 'send').mockImplementation(() => Promise.resolve({}))
      expect(service.deleteObject(null, null)).resolves.not.toThrow()
    })
  })

  describe('headObject', () => {
    it('should return a object', async () => {
      const result: S3Object = {
        key: 'key',
        sizeBytes: 1,
        modifiedOn: new Date()
      }
      jest.spyOn(S3Client.prototype, 'send').mockImplementation(() => Promise.resolve({
        ContentLength: result.sizeBytes,
        LastModified: result.modifiedOn
      }))
      expect(service.headObject(null, result.key)).resolves.toStrictEqual(result)
    })
  })

  describe('listObjects', () => {
    it('should return an array of objects', async () => {
      const result: S3ListObjectsResponse = {
        contents: [{ key: 'test' }]
      }
      jest.spyOn(S3Client.prototype, 'send').mockImplementation(() => Promise.resolve({
        Contents: result.contents.map(c => ({ Key: c.key }))
      }))
      expect(service.listObjects(null)).resolves.toMatchObject(result)
    })
  })

  describe('listObjects', () => {
    it('should always return an array for contents', async () => {
      jest.spyOn(S3Client.prototype, 'send').mockImplementation(() => Promise.resolve(null))
      expect(service.listObjects(null)).resolves.toMatchObject({ contents: [] })
    })
  })


  // Object Labels

  const kvpairs = [{ Key: 'a', Value: 'b' }, { Key: 'c', Value: 'd' }]
  const labelobj = { a: 'b', c: 'd' }

  describe('getObjectTagging', () => {
    it('should transform key value pairs to an object', async () => {
      jest.spyOn(S3Client.prototype, 'send').mockImplementation(() => Promise.resolve({ TagSet: kvpairs }))
      expect(service.getObjectTagging(null, null)).resolves.toStrictEqual(labelobj)
    })
  })

  describe('putObjecTagging', () => {
    it('should transform the label object into key value pairs', async () => {
      (PutObjectTaggingCommand as any).mockImplementation(() => { })
      jest.spyOn(S3Client.prototype, 'send').mockImplementation(() => Promise.resolve(null))
      service.putObjecTagging(null, null, labelobj)
      expect((PutObjectTaggingCommand as any).mock.calls[0][0]).toHaveProperty('Tagging', { TagSet: kvpairs })
    })
  })

  describe('deleteObjecTagging', () => {
    it('should not throw an error', async () => {
      jest.spyOn(S3Client.prototype, 'send').mockImplementation(() => Promise.resolve({}))
      expect(service.deleteObjecTagging(null, null)).resolves.not.toThrow()
    })
  })
});
