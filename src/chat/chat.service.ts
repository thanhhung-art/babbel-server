import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  async createMessage(data: {
    content: string;
    userId: string;
    conversationId: string;
    files?: string[];
  }) {
    const dataToCreate = {
      content: data.content,
      conversation: {
        connect: { id: data.conversationId },
      },
      user: {
        connect: { id: data.userId },
      },
    };

    if (data.files) {
      dataToCreate['files'] = {
        connect: data.files.map((fileId) => ({ id: fileId })),
      };
    }

    return await this.prismaService.messageInConversation.create({
      data: dataToCreate,
      include: { files: { select: { url: true } } },
    });
  }

  async updateMessageInConversation(id: string, value: string) {
    return await this.prismaService.messageInConversation.update({
      where: { id },
      data: { content: value },
    });
  }

  async deleteMessageInConversation(id: string) {
    return await this.prismaService.messageInConversation.delete({
      where: { id },
    });
  }

  async createMessageAttachment(data: {
    type: string;
    messageInRoomId: string;
    fileIds: string[];
  }) {
    return await this.prismaService.messageAttachment.create({
      data: {
        type: data.type,
        files: {
          connect: data.fileIds.map((fileId) => ({ id: fileId })),
        },
        MessageInRoom: {
          connect: { id: data.messageInRoomId },
        },
      },
    });
  }

  async createMessageInRoom(data: {
    content: string;
    userId: string;
    roomId: string;
    files?: string[];
  }) {
    const dataToCreate = {
      content: data.content,
      room: {
        connect: { id: data.roomId },
      },
      user: {
        connect: { id: data.userId },
      },
    };

    if (data.files) {
      dataToCreate['files'] = {
        connect: data.files.map((fileId) => ({ id: fileId })),
      };
    }

    const message = await this.prismaService.messageInRoom.create({
      data: dataToCreate,
      include: {
        files: { select: { url: true } },
        user: { select: { name: true } },
      },
    });

    return message;
  }

  async getMessageInRoomWithAttachments(id: string) {
    return await this.prismaService.messageInRoom.findFirst({
      where: { id },
      include: { messageAttachment: true },
    });
  }

  async updateMessageInRoom(id: string, value: string) {
    return await this.prismaService.messageInRoom.update({
      where: { id },
      data: { content: value },
    });
  }

  async deleteMessageInRoom(id: string) {
    const files = await this.prismaService.files.findMany({
      where: { messageInRoomId: id },
    });

    if (files && files.length > 0) {
      await Promise.all(
        files.map(async (file) => {
          await this.awsService.deleteFileFromS3(file.name);
        }),
      );

      await this.prismaService.files.deleteMany({
        where: { messageInRoomId: id },
      });
    }

    return await this.prismaService.messageInRoom.delete({
      where: { id },
    });
  }

  async saveFile(data: {
    data: ArrayBuffer;
    messageAttachmentId: string;
    fileName: string;
    type: string;
  }) {
    const imageBuffer = Buffer.from(data.data);

    try {
      const fileUploaded = await this.awsService.uploadFIleToS3(
        imageBuffer,
        data.fileName,
        data.type,
      );

      console.log(fileUploaded);

      return await this.prismaService.files.create({
        data: {
          name: data.fileName,
          url: fileUploaded,
          type: data.type,
          messageAttachmentId: '',
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async getFiles(id: string) {
    return await this.prismaService.files.findMany({
      where: { messageAttachmentId: id },
    });
  }

  async getMessageAttachment(id: string) {
    return await this.prismaService.messageAttachment.findFirst({
      where: { id },
    });
  }

  async checkIfFriendBlocked(userId: string, friendId: string) {
    const cachedValue = await this.cacheService.get(`${userId}-${friendId}`);

    if (cachedValue) {
      return cachedValue;
    }

    const blockedUser = await this.prismaService.blockUser.findFirst({
      where: {
        blockerId: userId,
        blockedId: friendId,
      },
    });

    await this.cacheService.set(
      `${userId}-${friendId}`,
      blockedUser ? true : false,
    );

    return blockedUser ? true : false;
  }
}
