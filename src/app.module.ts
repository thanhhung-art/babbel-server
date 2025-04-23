import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AwsModule } from './aws/aws.module';
import { FileController } from './file/file.controller';
import { OnlineModule } from './online/online.module';
import { ChatModule } from './chat/chat.module';
import { FileModule } from './file/file.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    RoomModule,
    AuthModule,
    OnlineModule,
    ChatModule,
    AwsModule,
    FileModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    CacheModule,
  ],
  controllers: [FileController],
  providers: [],
})
export class AppModule {}
