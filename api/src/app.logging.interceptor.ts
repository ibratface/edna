import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { ClientRequest } from 'http';
import { Observable } from 'rxjs';

@Injectable()
export class AppLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logger = new Logger(context.getClass().name)
    const req = context.switchToHttp().getRequest<ClientRequest>()

    // TODO: Add user access logging here
    logger.verbose(`(${req.method}) ${req.path}`)
    
    return next.handle();
  }
}
