import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'src/types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Get('/friend-request')
  async findFriendRequest(@Query('user_id') id: string) {
    return await this.userService.getFriendRequest(id);
  }

  @Get('/friends')
  async findFriends(@Req() req: Request) {
    return await this.userService.getFriends(req.user_id);
  }

  @Get('/conversation')
  async createConversation(
    @Query('friend_id') friendId: string,
    @Req() req: Request,
  ) {
    return await this.userService.getConversation(req.user_id, friendId);
  }

  @Get('/conversations')
  async getConversations(@Req() req: Request) {
    return await this.userService.getConversations(req.user_id);
  }

  @Get('/conversation/messages')
  async getMessages(@Query('id') conversationId: string) {
    return await this.userService.getConversationMessages(conversationId);
  }

  @Get('/search')
  async findByName(@Query('value') value: string) {
    return await this.userService.findByName(value);
  }

  @Get('/chatting')
  async getChatting(@Req() req: Request) {
    return await this.userService.getChattingConversations(req.user_id);
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
    return await this.userService.sendFriendRequest(req.user_id, friendId);
  }

  @Post('/accept-friend-request')
  async acceptFriendRequest(
    @Query('user_id') userId: string,
    @Query('friend_id') friendId: string,
  ) {
    return await this.userService.acceptFriendRequest(userId, friendId);
  }

  @Post('/add-to-chatting')
  async addToChating(@Req() req: Request, @Query('id') friendId: string) {
    return await this.userService.addConversationToChatting(
      req.user_id,
      friendId,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }
}
