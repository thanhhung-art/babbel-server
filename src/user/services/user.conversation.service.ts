import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserConversationService {
  constructor(private readonly prismaService: PrismaService) {}

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
