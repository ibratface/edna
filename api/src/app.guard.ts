import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, skip } from 'rxjs';

@Injectable()
export class AppGuard implements CanActivate {

  constructor(private config: ConfigService) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest()

    const defaultToken = this.config.get<string>('APP_TOKEN')
    const skipAuth = this.config.get('SKIP_AUTH')

    // TODO: Replace with JWT check
    return skipAuth ?? req.headers?.authorization === `Bearer ${defaultToken}`
  }
}
