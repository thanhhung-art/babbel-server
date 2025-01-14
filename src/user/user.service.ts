import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ICreateUser } from './user.type';
import { UserActionService } from './services/user.action.service';
import { UserFriendService } from './services/user.friend.service';
import { UserConversationService } from './services/user.conversation.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userActionService: UserActionService,
    private readonly userFriendService: UserFriendService,
    private readonly userConversationService: UserConversationService,
  ) {}

  create(data: ICreateUser) {
    return this.userActionService.create(data);
  }

  findAll() {
    return this.userActionService.findAll();
  }

  findOne(email: string) {
    return this.userActionService.findOne(email);
  }

  findByEmail(email: string) {
    return this.userActionService.findByEmail(email);
  }

  findById(id: string) {
    return this.userActionService.findById(id);
  }

  findByName(name: string, status: 'friend' | 'unfriend', userId: string) {
    return this.userActionService.findByName(name, status, userId);
  }

  delete(id: string) {
    return this.userActionService.delete(id);
  }

  sendFriendRequest(userId: string, friendId: string) {
    return this.userFriendService.sendFriendRequest(userId, friendId);
  }

  getFriendRequest(userId: string) {
    return this.userFriendService.getFriendRequest(userId);
  }

  getRequestFriend(userId: string) {
    return this.userFriendService.getRequestFriend(userId);
  }

  acceptFriendRequest(userId: string, friendId: string) {
    return this.userFriendService.acceptFriendRequest(userId, friendId);
  }

  deleteFriendRequest(userId: string, friendId: string) {
    return this.userFriendService.deleteFriendRequest(userId, friendId);
  }

  getFriends(userId: string) {
    return this.userFriendService.getFriends(userId);
  }

  getConversation(userId: string, friendId: string) {
    return this.userConversationService.getConversation(userId, friendId);
  }

  getConversations(userId: string) {
    return this.userConversationService.getConversations(userId);
  }

  getConversationById(conversationId: string, userId: string) {
    return this.userConversationService.getConversationById(
      conversationId,
      userId,
    );
  }

  getConversationMessages(conversationId: string) {
    return this.userConversationService.getConversationMessages(conversationId);
  }

  getFriendsOnline(
    userId: string,
  ): Promise<{ id: string; socketId: string }[]> {
    return this.userActionService.getFriendsOnline(userId);
  }

  getUserSocketId(userId: string) {
    return this.userActionService.getUserSocketId(userId);
  }

  createUserOnline(userId: string, socketId: string) {
    return this.userActionService.createUserOnline(userId, socketId);
  }

  deleteUserOnline(userId: string) {
    return this.userActionService.deleteUserOnline(userId);
  }

  addConversationToChatting(userId: string, friendId: string) {
    return this.userConversationService.addConversationToChatting(
      userId,
      friendId,
    );
  }

  removeConversationFromChatting(id: string) {
    return this.userConversationService.removeConversationFromChatting(id);
  }

  getChattingConversations(userId: string) {
    return this.userConversationService.getChattingConversations(userId);
  }

  blockUser(userId: string, friendId: string) {
    return this.userActionService.blockUser(userId, friendId);
  }

  unblockUser(userId: string, friendId: string) {
    return this.userActionService.unBlockUser(userId, friendId);
  }

  getBlockedUsers(userId: string) {
    return this.userActionService.getBlockedUsers(userId);
  }

  unfriend(userId: string, friendId: string) {
    return this.userActionService.unfriend(userId, friendId);
  }

  checkRoomAdmin(userId: string, roomId: string) {
    return this.userActionService.checkRoomAdmin(userId, roomId);
  }

  leaveRoom(userId: string, roomId: string) {
    return this.userActionService.leaveRoom(userId, roomId);
  }

  getRoomsJoined(userId: string) {
    return this.userActionService.getRoomsJoined(userId);
  }

  updateProfile(userId: string, avatar: string, name: string, email: string) {
    return this.userActionService.updateProfile(userId, avatar, name, email);
  }

  resetPassword(id: string, oldPassword: string, newPassword: string) {
    return this.userActionService.resetPassword(id, oldPassword, newPassword);
  }
}
