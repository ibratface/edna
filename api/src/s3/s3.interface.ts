export interface S3Bucket {
  createdOn: Date
  name: string
}

export interface S3Object {
  key: string
  sizeBytes?: number
  modifiedOn?: Date
}

export interface S3ListObjectsOptions {
  prefix?: string
  delimiter?: string
  maxKeys?: number
  continuationToken?: string
}

export interface S3ListObjectsResponse {
  contents: S3Object[]
  isTruncated?: boolean
  keyCount?: number
  maxKeys?: number
  nextContinuationToken?: string
}