import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatasetController } from './dataset/dataset.controller';
import { S3Service } from './s3/s3.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppGuard } from './app.guard';


@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, DatasetController],
  providers: [AppService, S3Service, ConfigService, {
    provide: APP_GUARD,
    useClass: AppGuard
  }],
})
export class AppModule { }
