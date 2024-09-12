import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';
import { ChatGateway } from './chat/chat.gateway';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './user/user.service';
import { ChatService } from './chat/chat.service';
import { AwsModule } from './aws/aws.module';
import { AwsService } from './aws/aws.service';
import { FileService } from './file/file.service';
import { FileController } from './file/file.controller';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    RoomModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    AwsModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
      }),
    }),
  ],
  controllers: [FileController],
  providers: [ChatGateway, UserService, ChatService, AwsService, FileService],
})
export class AppModule {}
