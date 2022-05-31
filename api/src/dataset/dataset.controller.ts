import { Body, Controller, Delete, Get, HttpException, HttpStatus, Options, Param, Post } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import { CreateDatasetDto, DownloadUrlResponse, UploadUrlResponse } from './dataset.dto';
import { nanoid } from 'nanoid'
import { Data, Dataset } from './dataset.interface';


// TODO: Document return values for all endpoints
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
  async listDatasets(): Promise<Dataset[]> {
    return await this.s3.listBuckets()
  }

  @Post()
  async createDataset(@Body() body: CreateDatasetDto): Promise<void> {
    // TODO: name cleaning
    return await this.s3.createBucket(body.name)
  }

  @Delete(':datasetId')
  async deleteDataset(@Param('datasetId') datasetId: string): Promise<void> {
    await this.assertDatasetExists(datasetId)

    return await this.s3.deleteBucket(datasetId)
  }

  @Get(':datasetId/data')
  async listData() {

  }

  @Options(':datasetId/data')
  async uploadData(@Param('datasetId') datasetId: string): Promise<UploadUrlResponse> {
    await this.assertDatasetExists(datasetId)

    const newDataId = nanoid() // generate a new url-friendly id
    const uploadUrl = await this.s3.getSignedUrlPutObject(datasetId, newDataId)
    return {
      uploadUrl
    }
  }

  @Options(':datasetId/data/:dataId')
  async updateData(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<UploadUrlResponse> {
    await this.assertDataExists(datasetId, dataId)

    const uploadUrl = await this.s3.getSignedUrlPutObject(datasetId, dataId)
    return {
      uploadUrl
    }
  }

  @Options(':datasetId/data/:dataId')
  async downloadData(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<DownloadUrlResponse> {
    await this.assertDataExists(datasetId, dataId)

    const downloadUrl = await this.s3.getSignedUrlPutObject(datasetId, dataId)
    return {
      downloadUrl
    }
  }

  @Delete(':datasetId/data/:dataId')
  async deleteData(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<void> {
    await this.assertDataExists(datasetId, dataId)

    return await this.s3.deleteObject(datasetId, dataId)
  }

  @Get(':datasetId/data/:dataId')
  async getDataInfo(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<Data> {
    await this.assertDataExists(datasetId, dataId)

    return await this.s3.headObject(datasetId, dataId)
  }

  @Get(':datasetId/data/:dataId/label')
  async getDataLabel(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<object> {
    await this.assertDataExists(datasetId, dataId)

    return await this.s3.getObjectTagging(datasetId, dataId)
  }

  @Post(':datasetId/data/:dataId/label')
  async setDataLabel(@Param('datasetId') datasetId: string, @Param('dataId') dataId, @Body() label: object): Promise<void> {
    // TODO: clean label
    await this.assertDataExists(datasetId, dataId)

    return await this.s3.putObjecTagging(datasetId, dataId, label)
  }

  @Delete(':datasetId/data/:dataId/label')
  async unsetDataLabel(@Param('datasetId') datasetId: string, @Param('dataId') dataId): Promise<void> {
    await this.assertDataExists(datasetId, dataId)

    return await this.s3.deleteObjecTagging(datasetId, dataId)
  }
}
