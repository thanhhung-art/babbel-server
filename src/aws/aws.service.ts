import {
  PutObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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

      return `${this.configService.get<string>('CLOUDFRONT_URL')}/${fileName}`;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteFileFromS3(fileName: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
        Key: fileName,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to delete file');
    }
  }
}
