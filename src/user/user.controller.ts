import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'src/types';
import { CacheService } from 'src/cache/cache.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Get('/friend-request')
  async findFriendRequest(@Req() req: Request) {
    return await this.userService.getFriendRequest(req.user_id);
  }

  @Get('/friend-request-sent')
  async findRequestFriend(@Req() req: Request) {
    return await this.userService.getFriendRequestSent(req.user_id);
  }

  @Get('/friends')
  async findFriends(@Req() req: Request) {
    return await this.userService.getFriends(req.user_id);
  }

  @Get('/conversation/messages')
  async getMessages(@Query('id') conversationId: string) {
    return await this.userService.getConversationMessages(conversationId);
  }

  @Get('/conversation/:id')
  async getConversation(
    @Param('id') conversationId: string,
    @Req() req: Request,
  ) {
    return await this.userService.getConversationById(
      conversationId,
      req.user_id,
    );
  }

  @Get('/conversations')
  async getConversations(@Req() req: Request) {
    return await this.userService.getConversations(req.user_id);
  }

  @Get('/conversation')
  async createConversation(
    @Query('friend_id') friendId: string,
    @Req() req: Request,
  ) {
    return await this.userService.getConversation(req.user_id, friendId);
  }

  @Get('/search')
  async findByName(@Req() req: Request, @Query('value') value: string) {
    return await this.userService.findByName(value);
  }

  @Get('/search-chatting')
  async getChattingConversation(
    @Req() req: Request,
    @Query('name') keyword: string,
  ) {
    return await this.userService.searchNameInChatting(req.user_id, keyword);
  }

  @Get('/chatting')
  async getChatting(@Req() req: Request) {
    return await this.userService.getChattingConversations(req.user_id);
  }

  @Get('/check-admin/:roomid')
  async checkAdmin(@Req() req: Request, @Param('roomid') roomId: string) {
    const result = await this.userService.checkRoomAdmin(req.user_id, roomId);
    return { isAdmin: result };
  }

  @Get('room-joined')
  async getRoomsJoined(@Req() req: Request) {
    return await this.userService.getRoomsJoined(req.user_id);
  }

  @Get(':email')
  async findOne(@Param('email') id: string) {
    return await this.userService.findOne(id);
  }

  @Post('/friend-request')
  async friendRequest(
    @Req() req: Request,
    @Query('friend_id') friendId: string,
  ) {
    await this.cacheService.clearCachesByKeys([
      `cache_/api/user/friend-request_${req.user_id}`,
      `cache_/api/user/request-friend_${req.user_id}`,
    ]);
    return await this.userService.sendFriendRequest(req.user_id, friendId);
  }

  @Post('/accept-friend-request')
  async acceptFriendRequest(
    @Req() req: Request,
    @Query('friend_id') friendId: string,
  ) {
    await this.cacheService.clearCachesByKeys([
      `cache_/api/user/friend-request_${req.user_id}`,
      `cache_/api/user/request-friend_${req.user_id}`,
    ]);
    return await this.userService.acceptFriendRequest(friendId, req.user_id);
  }

  @Post('/add-to-chatting')
  async addToChating(@Req() req: Request, @Query('id') friendId: string) {
    await this.cacheService.clearCachesByKeys([
      `cache_/api/user/chatting_user_${req.user_id}`,
      `cache_/api/user/chatting_user_${friendId}`,
    ]);
    return await this.userService.addConversationToChatting(
      req.user_id,
      friendId,
    );
  }

  @Post('/block/:id')
  async blockUser(@Req() req: Request, @Param('id') friendId: string) {
    return await this.userService.blockUser(req.user_id, friendId);
  }

  @Post('/unfriend/:id')
  async unfriend(@Req() req: Request, @Param('id') friendId: string) {
    await this.cacheService.clearCachesByKeys([
      `cache_/api/user/friends_${req.user_id}`,
      `cache_/api/user/friends_${friendId}`,
    ]);
    return await this.userService.unfriend(req.user_id, friendId);
  }

  @Post('/leave-room/:id')
  async leaveRoom(@Req() req: Request, @Param('id') roomId: string) {
    await this.cacheService.clearCachesByKeys([
      `cache_/api/user/chatting_user_${req.user_id}`,
      `cache_/api/user/chatting_user_${roomId}`,
      `cache_/api/user/room-joined_user_${req.user_id}`,
    ]);
    return await this.userService.leaveRoom(req.user_id, roomId);
  }

  @Put('/update-profile')
  async update(@Req() req: Request) {
    const { name, email, avatar } = req.body;
    await this.cacheService.clearCacheByKey(
      `cache_/api/auth/user_user_${req.user_id}`,
    );
    return await this.userService.updateProfile(
      req.user_id,
      avatar,
      name,
      email,
    );
  }

  @Put('/reset-password')
  async resetPassword(@Req() req: Request) {
    const { oldPassword, newPassword } = req.body;
    return await this.userService.resetPassword(
      req.user_id,
      oldPassword,
      newPassword,
    );
  }

  @Delete('/friend-request/:id')
  async deleteFriendRequest(
    @Param('id') friendId: string,
    @Req() req: Request,
  ) {
    await this.cacheService.clearCacheByKey(
      `cache_/api/user/friend-request_${req.user_id}`,
    );
    return await this.userService.deleteFriendRequest(friendId, req.user_id);
  }

  @Delete('/chatting/:id')
  async deleteChatting(@Param('id') conversationId: string) {
    await this.cacheService.clearCacheByKey(
      `cache_/api/user/chatting_user_${conversationId}`,
    );
    return await this.userService.removeConversationFromChatting(
      conversationId,
    );
  }

  @Delete(':id')
  async deleteAccount(@Param('id') id: string) {
    return await this.userService.deleteAccount(id);
  }
}
