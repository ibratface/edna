import { Body, Controller, Delete, Get, Options, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { CreateDatasetDto, DatasetDto, DataDto, DatasubsetDto } from './dataset.dto';
import { nanoid } from 'nanoid'
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DatasetErrorInterceptor } from './dataset.error.interceptor';
import { AppLoggingInterceptor } from '../app.logging.interceptor';


@Controller('dataset')
@UseInterceptors(AppLoggingInterceptor)
@UseInterceptors(DatasetErrorInterceptor)
export class DatasetController {

  constructor(private s3: S3Service) { }


  @Get()
  @ApiOperation({ description: 'List all available datasets.' })
  @ApiOkResponse({ type: DatasetDto, isArray: true, description: 'Array of datasets' })
  async listDatasets(): Promise<DatasetDto[]> {
    return await this.s3.listBuckets()
  }


  @Post()
  @ApiOperation({ description: 'Create a new empty dataset.' })
  @ApiOkResponse({ description: 'Dataset created.' })
  async createDataset(@Body() body: CreateDatasetDto): Promise<void> {
    // TODO: data cleaning for dataset name
    return await this.s3.createBucket(body.name)
  }


  @Delete(':datasetId')
  @ApiOperation({ description: 'Delete an existing dataset.' })
  @ApiOkResponse({ description: 'Dataset deleted.' })
  @ApiNotFoundResponse({ description: 'Dataset not found.' })
  async deleteDataset(@Param('datasetId') datasetId: string): Promise<void> {
    return await this.s3.deleteBucket(datasetId)
  }


  @Get(':datasetId/data')
  @ApiOperation({ description: 'List available data of an existing dataset.' })
  @ApiQuery({ name: 'marker', description: 'Marker begin listing for pagination', required: false })
  @ApiQuery({ name: 'limit', description: 'Maximum number of data objects to return', required: false })
  @ApiOkResponse({ type: DatasubsetDto, description: 'All or a subset of the available data in the dataset.' })
  @ApiNotFoundResponse({ description: 'Dataset not found.' })
  async listData(@Param('datasetId') datasetId: string, @Query('marker') marker, @Query('limit') limit): Promise<DatasubsetDto> {
    const res = await this.s3.listObjects(datasetId, { continuationToken: marker, maxKeys: limit })
    return {
      entries: res.contents ?? [],
      hasMore: res.isTruncated ?? false,
      marker: res.nextContinuationToken
    }
  }


  @Post(':datasetId/data')
  @ApiOperation({ description: 'Get a new key and URL for uploading a new data object' })
  @ApiOkResponse({ type: DataDto, description: 'A key and presigned URL for upload' })
  @ApiNotFoundResponse({ description: 'Dataset not found.' })
  async uploadData(@Param('datasetId') datasetId: string): Promise<DataDto> {
    const key = nanoid() // generate a new url-friendly id
    const uploadUrl = await this.s3.getSignedUrlPutObject(datasetId, key)
    return {
      key,
      uploadUrl
    }
  }


  @Get(':datasetId/data/:dataId')
  @ApiOperation({ description: 'Get information about a data object including upload / download URLs' })
  @ApiParam({ name: 'dataId', type: String })
  @ApiOkResponse({ type: DataDto, description: 'Information about the data object' })
  @ApiNotFoundResponse({ description: 'Dataset or data does not exist.' })
  async downloadData(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<DataDto> {
    const info = this.s3.headObject(datasetId, dataId) // check if it exists
    const downloadUrl = await this.s3.getSignedUrlGetObject(datasetId, dataId)
    const uploadUrl = await this.s3.getSignedUrlPutObject(datasetId, dataId)
    return {
      ...info,
      uploadUrl,
      downloadUrl
    }
  }


  @Delete(':datasetId/data/:dataId')
  @ApiOperation({ description: 'Delete an existing data object in an existing dataset.' })
  @ApiParam({ name: 'dataId', type: String })
  @ApiOkResponse({ description: 'Data object deleted.' })
  @ApiNotFoundResponse({ description: 'Dataset or data does not exist.' })
  async deleteData(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<void> {
    return await this.s3.deleteObject(datasetId, dataId)
  }


  @Get(':datasetId/data/:dataId/label')
  @ApiOperation({ description: 'Get the label of an existing data object.' })
  @ApiParam({ name: 'dataId', type: String })
  @ApiOkResponse({ type: Object, description: 'Current label object on the data.' })
  @ApiNotFoundResponse({ description: 'Dataset or data does not exist.' })
  async getDataLabel(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<object> {
    return await this.s3.getObjectTagging(datasetId, dataId)
  }


  @Post(':datasetId/data/:dataId/label')
  @ApiOperation({ description: 'Set the label of an existing data object.' })
  @ApiParam({ name: 'dataId', type: String })
  @ApiOkResponse({ description: 'Label applied.' })
  @ApiNotFoundResponse({ description: 'Dataset or data does not exist.' })
  async setDataLabel(@Param('datasetId') datasetId: string, @Param('dataId') dataId, @Body() label: object): Promise<void> {
    // TODO: data cleaning for label?
    return await this.s3.putObjecTagging(datasetId, dataId, label)
  }


  @Delete(':datasetId/data/:dataId/label')
  @ApiOperation({ description: 'Remove the label of an existing data object.' })
  @ApiParam({ name: 'dataId', type: String })
  @ApiOkResponse({ description: 'Label removed.' })
  @ApiNotFoundResponse({ description: 'Dataset or data does not exist.' })
  async unsetDataLabel(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<void> {
    return await this.s3.deleteObjecTagging(datasetId, dataId)
  }
}
