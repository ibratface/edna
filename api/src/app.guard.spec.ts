import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppGuard } from './app.guard';
import { createMock } from '@golevelup/ts-jest';


describe('AppGuard', () => {

  let appGuard: AppGuard;
  let config: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppGuard, ConfigService],
    }).compile();

    appGuard = module.get<AppGuard>(AppGuard);
    config = module.get<ConfigService>(ConfigService);
  });


  it('should be defined', () => {
    expect(appGuard).toBeDefined();
  });


  it('should return true with correct token', () => {
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({
      headers: {
        authorization: `Bearer ${config.get('APP_TOKEN')}`,
      },
    });

    expect(appGuard.canActivate(context)).toBeTruthy();
  })


  it('should return false with anything else', () => {
    const context = createMock<ExecutionContext>();
    const canActivate = expect(appGuard.canActivate(context))
    if (config.get('SKIP_AUTH')) {
      canActivate.toBeTruthy(); // always truthy is skip auth flag is on
    }
    else {
      canActivate.toBeFalsy();
    }
  })

});
