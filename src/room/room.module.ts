import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CacheService } from 'src/cache/cache.service';

@Module({
  controllers: [RoomController],
  providers: [RoomService, CacheService],
  imports: [PrismaModule],
})
export class RoomModule {}
