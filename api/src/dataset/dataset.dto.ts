import { ApiProperty } from "@nestjs/swagger"
import { S3Bucket, S3Object } from "src/s3/s3.interface"

export class CreateDatasetDto {
  @ApiProperty()
  name: string
}

export class DatasetDto implements S3Bucket {
  @ApiProperty()
  name: string

  @ApiProperty({ required: false })
  createdOn: Date
}

export class DataDto implements S3Object {
  @ApiProperty()
  key: string

  @ApiProperty({ required: false })
  sizeBytes?: number

  @ApiProperty({ required: false })
  modifiedOn?: Date

  @ApiProperty({ required: false })
  uploadUrl?: string

  @ApiProperty({ required: false })
  downloadUrl?: string
}

export class DatasubsetDto {
  @ApiProperty({ type: DataDto, isArray: true })
  entries: DataDto[]

  @ApiProperty({ required: false })
  hasMore?: boolean
  
  @ApiProperty({ required: false })
  marker?: string
}