import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { defaultIfEmpty, Observable } from 'rxjs';

@Injectable()
export class AppGuard implements CanActivate {

  constructor(private config: ConfigService) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest()

    const defaultToken = this.config.get<string>('APP_TOKEN')
    const nodeEnv = this.config.get<string>('NODE_ENV')
    
    return nodeEnv === 'dev' || req.headers?.authorization === `Bearer ${defaultToken}`
  }
}
