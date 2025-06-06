import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AwsService } from './aws.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'AWS_S3_CLIENT',
      useFactory: async (configService: ConfigService) => {
        await ConfigModule.envVariablesLoaded;
        return new S3Client({
          region: configService.get('AWS_REGION'),
          credentials: {
            accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
          },
        });
      },
      inject: [ConfigService],
    },
    AwsService,
  ],
  exports: ['AWS_S3_CLIENT', AwsService],
})
export class AwsModule {}
