import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppGuard } from './app.guard';


describe('AppGuard', () => {
  let appGuard: AppGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppGuard, ConfigService],
    }).compile();

    appGuard = module.get<AppGuard>(AppGuard);
  });


  it('should be defined', () => {
    expect(appGuard).toBeDefined();
  });
});
