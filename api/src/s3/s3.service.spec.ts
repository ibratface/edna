import { PutObjectTaggingCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { S3Bucket } from './s3.interface';
import { S3Service } from './s3.service';
jest.mock('@aws-sdk/client-s3')


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
});
