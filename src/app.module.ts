import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';
import { ChatGateway } from './chat/chat.gateway';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user/user.service';
import { ChatService } from './chat/chat.service';
import { AwsModule } from './aws/aws.module';
import { AwsService } from './aws/aws.service';
import { FileService } from './file/file.service';
import { FileController } from './file/file.controller';

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
  ],
  controllers: [FileController],
  providers: [ChatGateway, UserService, ChatService, AwsService, FileService],
})
export class AppModule {}
