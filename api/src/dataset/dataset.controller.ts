import { Body, Controller, Delete, Get, HttpException, HttpStatus, Options, Param, Post, Query } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import { CreateDatasetDto, DatasetDto, DataDto, DownloadUrlDto, UploadUrlDto, DatasubsetDto } from './dataset.dto';
import { nanoid } from 'nanoid'
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';


@Controller('dataset')
export class DatasetController {

  constructor(private s3: S3Service) { }

  // TODO: replace this with middleware
  private async assertDatasetExists(datasetId: string): Promise<void> {
    if (!await this.s3.headBucket(datasetId)) throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND)
  }

  // TODO: replace this with middleware
  private async assertDataExists(datasetId: string, dataId: string): Promise<void> {
    if (!await this.s3.headObject(datasetId, dataId)) throw new HttpException('Data not found', HttpStatus.NOT_FOUND)
  }

  @Get('list')
  @ApiOperation({ description: 'List all available datasets.' })
  @ApiOkResponse({ type: DatasetDto, isArray: true, description: 'Array of datasets' })
  async listDatasets(): Promise<DatasetDto[]> {
    return await this.s3.listBuckets()
  }

  @Post()
  @ApiOperation({ description: 'Create a new empty dataset.' })
  @ApiOkResponse({ description: 'Dataset created.' })
  async createDataset(@Body() body: CreateDatasetDto): Promise<void> {
    // TODO: clean dataset name
    return await this.s3.createBucket(body.name)
  }

  @Delete(':datasetId')
  @ApiOperation({ description: 'Delete an existing dataset.' })
  @ApiOkResponse({ description: 'Dataset deleted.' })
  @ApiNotFoundResponse({ description: 'Dataset not found.' })
  async deleteDataset(@Param('datasetId') datasetId: string): Promise<void> {
    await this.assertDatasetExists(datasetId)

    return await this.s3.deleteBucket(datasetId)
  }

  @Get(':datasetId/data')
  @ApiOperation({ description: 'List available data of an existing dataset.' })
  @ApiOkResponse({ type: DatasubsetDto, description: 'All or a subset of the available data in the dataset.' })
  @ApiNotFoundResponse({ description: 'Dataset not found.' })
  async listData(@Param('datasetId') datasetId: string, @Query('market') marker, @Query('limit') limit): Promise<DatasubsetDto> {
    await this.assertDatasetExists(datasetId)

    const res = await this.s3.listObjects(datasetId, { continuationToken: marker, maxKeys: limit })
    return {
      entries: res.contents ?? [],
      hasMore: res.isTruncated ?? false,
      marker: res.nextContinuationToken
    }
  }

  @Options(':datasetId/data')
  @ApiOperation({ description: 'Provide a URL for uploading to an existing dataset.' })
  @ApiOkResponse({ type: UploadUrlDto, description: 'An upload URL.' })
  @ApiNotFoundResponse({ description: 'Dataset not found.' })
  async uploadData(@Param('datasetId') datasetId: string): Promise<UploadUrlDto> {
    await this.assertDatasetExists(datasetId)

    const newDataId = nanoid() // generate a new url-friendly id
    const uploadUrl = await this.s3.getSignedUrlPutObject(datasetId, newDataId)
    return {
      uploadUrl
    }
  }

  @Options(':datasetId/data/:dataId')
  @ApiOperation({ description: 'Provide a URL for updating an existing data in an existing dataset.' })
  @ApiParam({ name: 'dataId', type: String })
  @ApiOkResponse({ type: UploadUrlDto, description: 'An upload URL.' })
  @ApiNotFoundResponse({ description: 'Dataset or data does not exist.' })
  async updateData(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<UploadUrlDto> {
    await this.assertDataExists(datasetId, dataId)

    const uploadUrl = await this.s3.getSignedUrlPutObject(datasetId, dataId)
    return {
      uploadUrl
    }
  }

  @Options(':datasetId/data/:dataId')
  @ApiOperation({ description: 'Provide a URL for downloading data from an existing dataset.' })
  @ApiParam({ name: 'dataId', type: String })
  @ApiOkResponse({ type: DownloadUrlDto, description: 'An download URL.' })
  @ApiNotFoundResponse({ description: 'Dataset or data does not exist.' })
  async downloadData(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<DownloadUrlDto> {
    await this.assertDataExists(datasetId, dataId)

    const downloadUrl = await this.s3.getSignedUrlPutObject(datasetId, dataId)
    return {
      downloadUrl
    }
  }

  @Delete(':datasetId/data/:dataId')
  @ApiOperation({ description: 'Provide a URL for deleting an existing data in an existing dataset.' })
  @ApiParam({ name: 'dataId', type: String })
  @ApiOkResponse({ description: 'Data object deleted.' })
  @ApiNotFoundResponse({ description: 'Dataset or data does not exist.' })
  async deleteData(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<void> {
    await this.assertDataExists(datasetId, dataId)

    return await this.s3.deleteObject(datasetId, dataId)
  }

  @Get(':datasetId/data/:dataId')
  @ApiOperation({ description: 'Get information about a data object.' })
  @ApiParam({ name: 'dataId', type: String })
  @ApiOkResponse({ description: 'Data object info.' })
  @ApiNotFoundResponse({ description: 'Dataset or data does not exist.' })
  async getDataInfo(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<DataDto> {
    await this.assertDataExists(datasetId, dataId)

    return await this.s3.headObject(datasetId, dataId)
  }

  @Get(':datasetId/data/:dataId/label')
  @ApiOperation({ description: 'Get the label of an existing data object.' })
  @ApiParam({ name: 'dataId', type: String })
  @ApiOkResponse({ type: Object, description: 'Current label object on the data.' })
  @ApiNotFoundResponse({ description: 'Dataset or data does not exist.' })
  async getDataLabel(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<object> {
    await this.assertDataExists(datasetId, dataId)

    return await this.s3.getObjectTagging(datasetId, dataId)
  }

  @Post(':datasetId/data/:dataId/label')
  @ApiOperation({ description: 'Set the label of an existing data object.' })
  @ApiParam({ name: 'dataId', type: String })
  @ApiOkResponse({ description: 'Label applied.' })
  @ApiNotFoundResponse({ description: 'Dataset or data does not exist.' })
  async setDataLabel(@Param('datasetId') datasetId: string, @Param('dataId') dataId, @Body() label: object): Promise<void> {
    // TODO: clean label
    await this.assertDataExists(datasetId, dataId)

    return await this.s3.putObjecTagging(datasetId, dataId, label)
  }

  @Delete(':datasetId/data/:dataId/label')
  @ApiOperation({ description: 'Remove the label of an existing data object.' })
  @ApiParam({ name: 'dataId', type: String })
  @ApiOkResponse({ description: 'Label removed.' })
  @ApiNotFoundResponse({ description: 'Dataset or data does not exist.' })
  async unsetDataLabel(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<void> {
    await this.assertDataExists(datasetId, dataId)

    return await this.s3.deleteObjecTagging(datasetId, dataId)
  }
}
