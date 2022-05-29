import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

@Controller('data')
export class DataController {

  @Get(':id')
  info(@Param('id') id: string) {

  }

  @Delete(':id')
  delete(@Param('id') id: string) {

  }

  @Get(':id/update')
  update(@Param('id') id: string) {

  }

  @Get(':id/download')
  download(@Param('id') id: string) {

  }

  @Post(':id/label')
  label(@Param('id') id: string, @Body() label: any) {

  }

  @Delete(':id/label')
  unlabel(@Param('id') id: string) {

  }

}
