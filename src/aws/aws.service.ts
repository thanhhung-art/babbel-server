import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  constructor(
    @Inject('AWS_S3_CLIENT') private readonly s3Client: S3Client,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async uploadFIleToS3(buffer: Buffer, fileName: string, mimeType: string) {
    const params: PutObjectCommandInput = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Key: fileName,
      Body: buffer,
      ContentType: mimeType,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      return `https://${this.configService.get<string>('AWS_S3_BUCKET')}.s3.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
