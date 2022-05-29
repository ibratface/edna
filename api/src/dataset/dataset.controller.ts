import { Controller, Delete, Get, Post } from '@nestjs/common';

@Controller('dataset')
export class DatasetController {
  
  @Post()
  create() {

  }

  @Get(':id')
  info() {

  }

  @Delete(':id')
  delete() {

  }

  @Post(':id')
  upload() {

  }

  @Get('list')
  list() {

  }
}
