import { Injectable } from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  async createMessage(data: {
    content: string;
    userId: string;
    conversationId: string;
  }) {
    return await this.prismaService.messageInConversation.create({
      data: {
        content: data.content,
        conversation: {
          connect: { id: data.conversationId },
        },
        user: {
          connect: { id: data.userId },
        },
      },
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
      include: { files: { select: { url: true } } },
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
    const attachment = await this.prismaService.messageAttachment.findFirst({
      where: { messageInRoomId: id },
    });

    if (attachment) {
      await this.prismaService.files.deleteMany({
        where: { messageAttachmentId: attachment.id },
      });

      await this.prismaService.messageAttachment.delete({
        where: { id: attachment.id },
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
}
