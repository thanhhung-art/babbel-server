import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserFriendService {
  constructor(private readonly prismaService: PrismaService) {}

  async sendFriendRequest(userId: string, friendId: string) {
    const existingRequest = await this.prismaService.friendRequest.findFirst({
      where: {
        userId,
        friendId,
      },
    });

    if (existingRequest) {
      return { msg: 'Friend request already sent', friendId };
    } else {
      await this.prismaService.friendRequest.create({
        data: {
          userId,
          friendId,
        },
      });
      return { msg: 'Friend request sent', friendId };
    }
  }

  async getFriendRequestSent(userId: string) {
    const data = await this.prismaService.friendRequest.findMany({
      where: { userId },
    });

    if (!data) {
      return [];
    }

    const friendRequestSent = data.map((items) => items.friendId);

    const users = await this.prismaService.user.findMany({
      where: {
        id: { in: friendRequestSent },
      },
      select: {
        id: true,
        avatar: true,
        name: true,
      },
    });

    return users;
  }

  async getFriendRequest(userId: string) {
    const data = await this.prismaService.friendRequest.findMany({
      where: { friendId: userId },
    });

    if (!data || data.length === 0) {
      return [];
    }

    const friendRequest = data.map((items) => items.userId);

    const users = await this.prismaService.user.findMany({
      where: {
        id: { in: friendRequest },
      },
      select: {
        id: true,
        avatar: true,
        name: true,
      },
    });

    return users;
  }

  async acceptFriendRequest(userId: string, friendId: string) {
    if (!userId || !friendId) {
      throw new BadRequestException('Invalid user id or friend id');
    }
    const request = await this.prismaService.friendRequest.findFirst({
      where: { userId, friendId },
    });

    if (request) {
      await this.prismaService.friendRequest.delete({
        where: {
          id: request.id,
        },
      });
    }

    const existingFriend = await this.prismaService.friends.findFirst({
      where: {
        userId,
        friendId,
      },
    });

    if (existingFriend) {
      return { msg: 'Friend request accepted' };
    }

    await this.prismaService.friends.create({
      data: {
        userId,
        friendId,
      },
    });

    await this.prismaService.friends.create({
      data: {
        userId: friendId,
        friendId: userId,
      },
    });

    return { msg: 'Friend request accepted' };
  }

  async deleteFriendRequest(userId: string, friendId: string) {
    if (!userId || !friendId) {
      throw new BadRequestException('Invalid user id or friend id');
    }
    const request = await this.prismaService.friendRequest.findFirst({
      where: { userId, friendId },
    });

    await this.prismaService.friendRequest.delete({
      where: {
        id: request.id,
      },
    });

    return { msg: 'Friend request deleted' };
  }

  async getFriends(userId: string) {
    const data = await this.prismaService.friends.findMany({
      where: { userId },
    });

    if (!data) {
      return [];
    }

    const friends = data.map((items) => items.friendId);

    const users = await this.prismaService.user.findMany({
      where: {
        id: { in: friends },
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
}
