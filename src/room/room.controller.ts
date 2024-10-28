import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { Request } from 'src/types';
import {
  AcceptRequestDto,
  BanUserDto,
  KickUserDto,
  RejectRequestDto,
  UpdateRoomDto,
} from './room.dto';
import { CacheService } from 'src/cache/cache.service';

@Controller('room')
export class RoomController {
  constructor(
    @Inject() private readonly roomService: RoomService,
    private readonly cacheService: CacheService,
  ) {}

  @Get('/search')
  async findOneByName(
    @Req() req: Request,
    @Query('value') value: string,
    @Query('status') status: 'joined' | 'unjoined',
  ) {
    return await this.roomService.findByName(value, status, req.user_id);
  }

  @Get('/conversation/messages')
  async getMessages(@Query('id') roomId: string) {
    return await this.roomService.getMessagesByRoomId(roomId);
  }

  @Get('/members/:id')
  async getRoomMembers(@Param('id') roomId: string) {
    return await this.roomService.getMembersByRoomId(roomId);
  }

  @Get('/join-request/:id')
  async getJoinRequest(@Param('id') roomId: string) {
    const result = await this.roomService.getJoinRequestsByRoomId(roomId);
    console.log(result);
    return result;
  }

  @Get('/banned/:id')
  async getBannedUsers(@Param('id') roomId: string) {
    return await this.roomService.getBannedUsersByRoomId(roomId);
  }

  @Get('/check-admin/:id')
  async checkAdmin(@Req() req: Request, @Param('id') roomId: string) {
    const result = await this.roomService.checkRoomAdmin(req.user_id, roomId);
    return { isAdmin: result };
  }

  @Get('/total-member/:id')
  async getMembersAmount(@Param('id') roomId: string) {
    const result = await this.roomService.getTotalMembersByRoomId(roomId);
    return { total: result };
  }

  @Get('/total-join-request/:id')
  async getJoinRequestAmount(@Param('id') roomId: string) {
    const result = await this.roomService.getTotalJoinRequestsByRoomId(roomId);
    return { total: result };
  }

  @Get('/total-banned/:id')
  async getBannedUsersAmount(@Param('id') roomId: string) {
    const result = await this.roomService.getTotalBannedUsersByRoomId(roomId);
    return { total: result };
  }

  @Get('/info/:id')
  async getAllRooms(@Param('id') id: string) {
    return await this.roomService.getRoomInfo(id);
  }

  @Get(':id')
  async getRoomById(@Param('id') id: string) {
    return await this.roomService.findOneById(id);
  }

  @Post('/add-to-chatting')
  async addToChatting(@Req() req: Request, @Query('id') roomId: string) {
    await this.cacheService.clearCacheByKey(
      `cache_/api/user/chatting_user_${req.user_id}`,
    );
    return await this.roomService.addToChatting(req.user_id, roomId);
  }

  @Post('/join/:id')
  async joinRoom(@Req() req: Request, @Param('id') roomId: string) {
    await this.roomService.requestJoinRoom(req.user_id, roomId);
    await this.cacheService.clearCacheByKey(
      `cache_/api/room/join-request/${roomId}`,
    );
    return { message: 'Request sent', roomId };
  }

  @Post('/accept-join-request')
  async acceptJoinRequest(@Body() data: AcceptRequestDto) {
    await this.roomService.acceptJoinRequest(data.userId, data.roomId);
    await this.cacheService.clearCachesByKeys([
      `cache_/api/user/room-joined_user_${data.userId}`,
      `cache_/api/room/join-request/${data.roomId}`,
      `cache_/api/room/members/${data.roomId}`,
    ]);
    return { message: 'Request accepted' };
  }

  @Post('/reject-join-request')
  async rejectJoinRequest(@Body() data: RejectRequestDto) {
    await this.roomService.rejectJoinRequest(data.userId, data.roomId);
    await this.cacheService.clearCacheByKey(
      `cache_/api/room/join-request/${data.roomId}`,
    );
    return { message: 'Request rejected' };
  }

  @Post('/kick')
  async kickUser(@Body() data: KickUserDto) {
    await this.roomService.kickUser(data.userId, data.roomId);
    await this.cacheService.clearCacheByKey(
      `cache_/api/room/members/${data.roomId}`,
    );
    return { message: 'User kicked' };
  }

  @Post('/ban')
  async banUser(@Body() data: BanUserDto) {
    await this.roomService.banUser(data.userId, data.roomId);
    await this.cacheService.clearCachesByKeys([
      `cache_/api/room/members/${data.roomId}`,
      `cache_/api/room/banned/${data.roomId}`,
    ]);
    return { message: 'User banned' };
  }

  @Post('/unban')
  async unbanUser(@Body() data: BanUserDto) {
    await this.roomService.unbanUser(data.userId, data.roomId);
    await this.cacheService.clearCacheByKey(
      `cache_/api/room/banned/${data.roomId}`,
    );
    return { message: 'User unbanned' };
  }

  @Post()
  async createRoom(
    @Req() req: Request,
    @Body() data: { name: string; avatar: string },
  ) {
    return await this.roomService.create({ ...data, userId: req.user_id });
  }

  @Put(':id')
  async updateRoom(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() data: UpdateRoomDto,
  ) {
    await this.cacheService.clearCachesByKeys([`cache_/api/room/info/${id}`]);
    return await this.roomService.updateRoom({
      id,
      ...data,
      adminId: req.user_id,
    });
  }

  @Delete(':id')
  async deleteRoom(@Param('id') id: string) {
    await this.cacheService.clearCacheByKey('cache_/api/room/joined');
    return await this.roomService.deleteRoom(id);
  }
}
