import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataController } from './data/data.controller';
import { DatasetController } from './dataset/dataset.controller';

@Module({
  imports: [],
  controllers: [AppController, DataController, DatasetController],
  providers: [AppService],
})
export class AppModule {}
