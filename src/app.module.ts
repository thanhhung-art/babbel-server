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
  controllers: [],
  providers: [ChatGateway, UserService, ChatService, AwsService],
})
export class AppModule {}
