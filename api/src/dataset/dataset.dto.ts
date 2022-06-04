import { ApiProperty } from "@nestjs/swagger"
import { S3Bucket, S3Object } from "src/s3/s3.interface"

export class CreateDatasetDto {
  @ApiProperty()
  name: string
}

export class DatasetDto implements S3Bucket {
  @ApiProperty()
  createdOn: Date

  @ApiProperty()
  name: string
}

export class DataDto implements S3Object {
  @ApiProperty()
  key: string

  @ApiProperty()
  sizeBytes?: number

  @ApiProperty()
  modifiedOn?: Date

  @ApiProperty()
  uploadUrl?: string

  @ApiProperty()
  downloadUrl?: string
}

export class DatasubsetDto {
  @ApiProperty()
  entries: DataDto[]

  @ApiProperty()
  hasMore?: boolean
  
  @ApiProperty()
  marker?: string
}