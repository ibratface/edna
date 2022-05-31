import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppGuard } from './app.guard';


describe('AppGuard', () => {
  let appGuard: AppGuard;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    appGuard = app.get<AppGuard>(AppGuard);
  });


  it('should be defined', () => {
    expect(appGuard).toBeDefined();
  });
});
