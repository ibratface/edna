import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';

describe('S3Service', () => {
  let service: S3Service;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service, ConfigService],
    }).compile();

    service = module.get<S3Service>(S3Service);
    config = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBucket', () => {
    it('should return the bucket location', async () => {
      expect(await service.createBucket('test')).toHaveProperty('Location', '/test')
    })
  })
});
