import { Injectable } from '@nestjs/common';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  CreateBucketCommand,
  GetObjectTaggingCommand,
  PutObjectTaggingCommand,
  DeleteObjectTaggingCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Bucket, S3ListObjectsOptions, S3ListObjectsResponse, S3Object } from './s3.interface';


@Injectable()
export class S3Service {

  client: S3Client

  constructor(private config: ConfigService) {
    this.client = new S3Client({
      region: config.get<string>('AWS_REGION'),
      endpoint: config.get<string>('AWS_ENDPOINT_S3'),
      forcePathStyle: true
    })
  }

  // Buckets

  async createBucket(name: string): Promise<void> {
    const cmd = new CreateBucketCommand({ Bucket: name, ACL: 'private' })
    await this.client.send(cmd)
  }

  async deleteBucket(name: string): Promise<void> {
    const cmd = new DeleteBucketCommand({ Bucket: name })
    await this.client.send(cmd)
  }

  async headBucket(name: string): Promise<boolean> {
    const cmd = new HeadBucketCommand({ Bucket: name })
    await this.client.send(cmd)
    return true
  }

  async listBuckets(): Promise<S3Bucket[]> {
    const cmd = new ListBucketsCommand({})
    const res = await this.client.send(cmd)
    return res.Buckets ? res.Buckets.map((b): S3Bucket => ({ createdOn: b.CreationDate, name: b.Name })) : [];
  }

  // Objects

  async getSignedUrlGetObject(bucketName: string, objectKey: string, expiry: number = 3600): Promise<string> {
    const cmd = new GetObjectCommand({ Bucket: bucketName, Key: objectKey })
    const url = await getSignedUrl(this.client, cmd, { expiresIn: expiry })
    return url
  }

  async getSignedUrlPutObject(bucketName: string, objectKey: string, expiry: number = 3600): Promise<string> {
    const cmd = new PutObjectCommand({ Bucket: bucketName, Key: objectKey })
    const url = await getSignedUrl(this.client, cmd, { expiresIn: expiry })
    return url
  }

  async deleteObject(bucketName: string, objectKey: string): Promise<void> {
    const cmd = new DeleteObjectCommand({ Bucket: bucketName, Key: objectKey })
    await this.client.send(cmd)
  }

  async headObject(bucketName: string, objectKey: string): Promise<S3Object> {
    const cmd = new HeadObjectCommand({ Bucket: bucketName, Key: objectKey })
    const { ContentLength: sizeBytes, LastModified: modifiedOn } = await this.client.send(cmd)
    return { key: objectKey, sizeBytes, modifiedOn }
  }

  async listObjects(bucketName: string, options: S3ListObjectsOptions = {}): Promise<S3ListObjectsResponse> {
    const cmd = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: options.prefix,
      Delimiter: options.delimiter,
      MaxKeys: options.maxKeys,
      ContinuationToken: options.continuationToken
    })
    const { Contents, IsTruncated, KeyCount, MaxKeys, NextContinuationToken } = await this.client.send(cmd)
    const contents = Contents?.map((o): S3Object => ({ key: o.Key, sizeBytes: o.Size, modifiedOn: o.LastModified })) ?? []
    return {
      contents,
      isTruncated: IsTruncated,
      keyCount: KeyCount,
      maxKeys: MaxKeys,
      nextContinuationToken: NextContinuationToken
    }
  }

  // Object Tagging

  async getObjectTagging(bucketName: string, objectKey: string): Promise<object> {
    const cmd = new GetObjectTaggingCommand({ Bucket: bucketName, Key: objectKey })
    const { TagSet } = await this.client.send(cmd)
    // convert key value pairs to javascript object
    return Object.fromEntries(TagSet.map(t => [t.Key, t.Value]))
  }

  async putObjecTagging(bucketName: string, objectKey: string, tagObject: object): Promise<void> {
    // convert javascript object to key value pairs
    const TagSet = Object.entries(tagObject).map(([key, val]) => ({ Key: key, Value: val }))
    const cmd = new PutObjectTaggingCommand({ Bucket: bucketName, Key: objectKey, Tagging: { TagSet } })
    await this.client.send(cmd)
  }

  async deleteObjecTagging(bucketName: string, objectKey: string): Promise<void> {
    const cmd = new DeleteObjectTaggingCommand({ Bucket: bucketName, Key: objectKey })
    await this.client.send(cmd)
  }

}
