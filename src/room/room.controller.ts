import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { Request } from 'src/types';

@Controller('room')
export class RoomController {
  constructor(@Inject() private readonly roomService: RoomService) {}

  @Get('/search')
  async findOneByName(@Query('value') value: string) {
    return await this.roomService.findByName(value);
  }

  @Get('/joined')
  async findRoomByUserId(@Req() req: Request) {
    return await this.roomService.findRommByUserId(req.user_id);
  }

  @Get('/conversation/messages')
  async getMessages(@Query('id') roomId: string) {
    return await this.roomService.getMessagesByRoomId(roomId);
  }

  @Post('/add-to-chatting')
  async addToChatting(@Req() req: Request, @Query('id') roomId: string) {
    return await this.roomService.addToChatting(req.user_id, roomId);
  }

  @Post('/join/:id')
  async joinRoom(@Req() req: Request, @Param('id') roomId: string) {
    return await this.roomService.requestJoinRoom(req.user_id, roomId);
  }

  @Post()
  async createRoom(
    @Req() req: Request,
    @Body() data: { name: string; avatar: string },
  ) {
    return await this.roomService.create({ ...data, userId: req.user_id });
  }

  @Delete(':id')
  async deleteRoom(@Param('id') id: string) {
    return await this.roomService.deleteRoom(id);
  }
}
