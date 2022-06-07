import { AppLoggingInterceptor } from './app.logging.interceptor';

describe('AppLoggingInterceptor', () => {
  it('should be defined', () => {
    expect(new AppLoggingInterceptor()).toBeDefined();
  });
});
