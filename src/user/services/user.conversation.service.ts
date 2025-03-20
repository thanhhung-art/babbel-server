import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserConversationService {
  constructor(private readonly prismaService: PrismaService) {}

  async getConversation(userId: string, friendId: string) {
    const existingConversation =
      await this.prismaService.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: { id: userId },
              },
            },
            {
              participants: {
                some: { id: friendId },
              },
            },
          ],
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
      await this.addConversationToChatting(userId, existingConversation.id);
      await this.addConversationToChatting(friendId, existingConversation.id);
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

    await this.addConversationToChatting(userId, conversation.id);
    await this.addConversationToChatting(friendId, conversation.id);

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

  async getConversationById(conversationId: string, userId: string) {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        id: conversationId,
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

    if (!conversation) {
      return { msg: 'Not found' };
    }

    return conversation;
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
        files: {
          select: {
            id: true,
            url: true,
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

  async addConversationToChatting(userId: string, conversationId: string) {
    const existingChatting = await this.prismaService.chatting.findFirst({
      where: {
        userId,
        conversationId,
      },
    });

    if (existingChatting) {
      return existingChatting;
    }

    return await this.prismaService.chatting.create({
      data: {
        userId,
        conversationId,
      },
    });
  }

  async removeConversationFromChatting(id: string) {
    if (!id) {
      return { msg: 'Invalid id' };
    }

    const obj = await this.prismaService.chatting.findUnique({
      where: {
        id,
      },
    });

    if (!obj) {
      throw new HttpException('Not found', 404);
    }

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
    });

    if (!result) {
      return [];
    }

    return result;
  }

  async searchChatting(userId: string, keyword: string) {
    const result = await this.prismaService.chatting.findMany({
      where: {
        userId,
        OR: [
          {
            conversation: {
              participants: {
                some: {
                  name: {
                    contains: keyword,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
          {
            room: {
              name: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      // include: {
      //   conversation: {
      //     include: {
      //       participants: {
      //         select: {
      //           id: true,
      //           email: true,
      //           avatar: true,
      //           name: true,
      //         },
      //       },
      //     },
      //   },
      //   room: true,
      // },
    });

    if (!result || result.length === 0) {
      return [];
    }

    return result;
  }
}
