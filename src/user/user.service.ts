import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ICreateUser } from './user.type';
import { generateSalt, hashPassword } from 'src/utils/crypto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: ICreateUser) {
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
    return this.prismaService.user.findMany({
      where: { name: { contains: name } },
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

  async delete(id: string) {
    return this.prismaService.user.delete({ where: { id } });
  }

  async sendFriendRequest(userId: string, friendId: string) {
    const existingRequest = await this.prismaService.friendRequest.findFirst({
      where: {
        userId,
        friendId,
      },
    });

    if (existingRequest) {
      return 'Friend request already sent';
    } else {
      await this.prismaService.friendRequest.create({
        data: {
          userId,
          friendId,
        },
      });
      return 'Friend request sent';
    }
  }

  async getFriendRequest(userId: string) {
    const data = await this.prismaService.friendRequest.findMany({
      where: { userId },
    });

    if (!data) {
      return [];
    }

    const friendRequest = data.map((items) => items.friendId);

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
      return 'Friend request already accepted';
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

    return 'Friend request accepted';
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

  async getConversation(userId: string, friendId: string) {
    const existingConversation =
      await this.prismaService.conversation.findFirst({
        where: {
          participants: {
            some: { id: userId },
          },
        },
        include: {
          participants: {
            where: {
              id: friendId,
            },
            select: {
              id: true,
              email: true,
              avatar: true,
              name: true,
            },
          },
        },
      });

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = await this.prismaService.conversation.create({
      data: {
        participants: {
          connect: [{ id: userId }, { id: friendId }],
        },
      },
      include: {
        participants: {
          where: {
            id: friendId,
          },
          select: {
            id: true,
            email: true,
            avatar: true,
            name: true,
          },
        },
      },
    });

    return conversation;
  }

  async getConversations(userId: string) {
    const conversations = await this.prismaService.conversation.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        participants: {
          where: {
            NOT: {
              id: userId,
            },
          },
          select: {
            id: true,
            email: true,
            avatar: true,
            name: true,
          },
        },
      },
    });

    if (!conversations) {
      return [];
    }

    return conversations;
  }

  async getConversationMessages(conversationId: string) {
    const result = await this.prismaService.messageInConversation.findMany({
      where: {
        conversationId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            avatar: true,
            name: true,
          },
        },
        attachments: {
          select: {
            id: true,
            type: true,
            files: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!result) {
      return [];
    }

    return result;
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

  async addConversationToChatting(userId: string, friendId: string) {
    const existingConversation = await this.getConversation(userId, friendId);

    const existingChatting = await this.prismaService.chatting.findFirst({
      where: {
        userId,
        conversationId: existingConversation.id,
      },
    });

    if (existingChatting) {
      return existingChatting;
    }

    return await this.prismaService.chatting.create({
      data: {
        userId,
        conversationId: existingConversation.id,
      },
    });
  }

  async removeConversationFromChatting(id: string) {
    return await this.prismaService.chatting.delete({
      where: {
        id,
      },
    });
  }

  async getChattingConversations(userId: string) {
    const result = await this.prismaService.chatting.findMany({
      where: {
        userId,
      },
      include: {
        conversation: {
          include: {
            participants: {
              where: {
                NOT: {
                  id: userId,
                },
              },
              select: {
                id: true,
                email: true,
                avatar: true,
                name: true,
              },
            },
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            avatar: true,
            createdAt: true,
            updateAt: true,
          },
        },
      },
    });

    if (!result) {
      return [];
    }

    return result;
  }
}
