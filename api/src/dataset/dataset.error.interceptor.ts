import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable } from 'rxjs';

@Injectable()
export class DatasetErrorInterceptor implements NestInterceptor {
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        console.error(error)
        switch (error.name) {
          case 'NoSuchBucket':
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND)
          case 'NoSuchKey':
            throw new HttpException('Data not found', HttpStatus.NOT_FOUND)
          default:
            throw new HttpException('Unexpected error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
      })
    )
  }
}
