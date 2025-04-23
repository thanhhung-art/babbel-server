import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ICreateUser, IDataToUpdate } from '../user.type';
import { generateSalt, hashPassword, verifyPassword } from 'src/utils/crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cache } from 'cache-manager';
import { UserConversationService } from './user.conversation.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UserActionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userConversationService: UserConversationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(data: ICreateUser) {
    if (!data.email || !data.password || !data.name) {
      throw new HttpException('Email and password and name are required', 400);
    }

    const userExists = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      throw new HttpException('User with this email already exists', 400);
    }

    const saltToHash = generateSalt(16);
    const { hashedPassword, salt } = hashPassword(data.password, saltToHash);

    return this.prismaService.user.create({
      data: {
        ...data,
        password: hashedPassword,
        salt,
      },
    });
  }

  async findAll() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        avatar: true,
        createdAt: true,
        updateAt: true,
      },
    });
  }

  async findOne(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        avatar: true,
        createdAt: true,
        updateAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        avatar: true,
        createdAt: true,
        updateAt: true,
        name: true,
        FriendRequest: true,
      },
    });
  }

  async findByName(name: string) {
    if (!name.trim()) return [];

    return this.prismaService.user.findMany({
      where: {
        name: { contains: name },
      },
      select: {
        id: true,
        email: true,
        avatar: true,
        createdAt: true,
        updateAt: true,
        name: true,
      },
    });
  }

  async getFriendsOnline(
    userId: string,
  ): Promise<{ id: string; socketId: string }[]> {
    const friends = await this.prismaService.friends.findMany({
      where: {
        userId,
      },
    });

    const onlineFriends: { id: string; socketId: string }[] = [];
    for (const friend of friends) {
      const friendSocket = await this.prismaService.userOnline.findFirst({
        where: {
          userId: friend.friendId,
        },
      });

      if (friendSocket) {
        onlineFriends.push({
          id: friend.friendId,
          socketId: friendSocket.socketId,
        });
      }
    }

    return onlineFriends;
  }

  async getUserSocketId(userId: string) {
    const userOnline = await this.prismaService.userOnline.findFirst({
      where: {
        userId,
      },
    });

    if (!userOnline) {
      return null;
    }

    return userOnline.socketId;
  }

  async createUserOnline(userId: string, socketId: string) {
    if (!userId) {
      return;
    }
    // remove when develop success
    if (await this.prismaService.userOnline.findFirst({ where: { userId } })) {
      await this.prismaService.userOnline.update({
        where: {
          userId,
        },
        data: {
          socketId,
        },
      });
      return;
    }
    return await this.prismaService.userOnline.create({
      data: {
        userId,
        socketId,
      },
    });
  }

  async deleteUserOnline(userId: string) {
    return await this.prismaService.userOnline.delete({
      where: {
        userId,
      },
    });
  }

  async blockUser(userId: string, friendId: string) {
    const existingBlock = await this.prismaService.blockUser.findFirst({
      where: {
        blockerId: userId,
        blockedId: friendId,
      },
    });

    if (existingBlock) {
      return { msg: 'User already blocked' };
    }

    await this.prismaService.blockUser.create({
      data: {
        blockerId: userId,
        blockedId: friendId,
      },
    });

    return { msg: 'User blocked' };
  }

  async unBlockUser(userId: string, friendId: string) {
    await this.cacheManager.del(`${userId}-block-${friendId}`);
    await this.prismaService.blockUser.deleteMany({
      where: {
        blockerId: userId,
        blockedId: friendId,
      },
    });

    return { msg: 'User unblocked' };
  }

  async getBlockedUsers(userId: string) {
    const data = await this.prismaService.blockUser.findMany({
      where: { blockerId: userId },
    });

    if (!data) {
      return [];
    }

    const blockedUsers = data.map((items) => items.blockedId);

    const users = await this.prismaService.user.findMany({
      where: {
        id: { in: blockedUsers },
      },
      select: {
        id: true,
        email: true,
        avatar: true,
        name: true,
      },
    });

    return users;
  }

  async unfriend(userId: string, friendId: string) {
    const conversation = await this.userConversationService.getConversation(
      userId,
      friendId,
    );

    await this.prismaService.chatting.deleteMany({
      where: {
        userId,
        conversationId: conversation.id,
      },
    });

    await this.prismaService.chatting.deleteMany({
      where: {
        userId: friendId,
        conversationId: conversation.id,
      },
    });

    await this.prismaService.friends.deleteMany({
      where: {
        userId,
        friendId,
      },
    });

    await this.prismaService.friends.deleteMany({
      where: {
        userId: friendId,
        friendId: userId,
      },
    });

    return { msg: 'User unfriended' };
  }

  async checkRoomAdmin(userId: string, roomId: string) {
    const result = await this.prismaService.roomAdmin.findFirst({
      where: { userId, roomId },
    });

    return !!result;
  }

  async leaveRoom(userId: string, roomId: string) {
    await this.prismaService.chatting.deleteMany({
      where: { userId, roomId },
    });

    await this.prismaService.roomMember.deleteMany({
      where: { userId, roomId },
    });

    return { msg: 'User left room' };
  }

  async getRoomsJoined(userId: string) {
    const rooms = await this.prismaService.room.findMany({
      where: { members: { some: { userId } } },
    });

    return rooms;
  }

  async updateProfile(
    userId: string,
    avatar: string | null,
    name: string | null,
    email: string | null,
  ) {
    const dataToUpdate: IDataToUpdate = {};

    if (name) {
      dataToUpdate.name = name;
    }

    if (email) {
      dataToUpdate.email = email;
    }

    if (avatar) {
      dataToUpdate.avatar = avatar;
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return { msg: 'Profile updated' };
  }

  async resetPassword(id: string, oldPassword: string, newPassword: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const checkOldPassword = verifyPassword(
      oldPassword,
      user.salt,
      user.password,
    );

    if (!checkOldPassword) {
      throw new HttpException('Old password is incorrect', 400);
    }

    const saltToHash = generateSalt(16);

    const { hashedPassword, salt } = hashPassword(newPassword, saltToHash);

    await this.prismaService.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        salt,
      },
    });

    return { msg: 'Password updated' };
  }

  async deleteAccount(id: string) {
    await this.prismaService.user.delete({
      where: { id },
    });

    return { msg: 'Account deleted' };
  }
}
