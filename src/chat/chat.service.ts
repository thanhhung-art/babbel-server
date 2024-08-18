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
  }) {
    return await this.prismaService.messageAttachment.create({
      data: {
        type: data.type,
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
  }) {
    const message = await this.prismaService.messageInRoom.create({
      data: {
        content: data.content,
        room: {
          connect: { id: data.roomId },
        },
        user: {
          connect: { id: data.userId },
        },
      },
    });

    return message;
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
        where: { messageAttcachmentId: attachment.id },
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
          messageAttcachmentId: data.messageAttachmentId,
          MessageAttachment: {
            connect: { id: data.messageAttachmentId },
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async getFiles(id: string) {
    return await this.prismaService.files.findMany({
      where: { messageAttcachmentId: id },
    });
  }
}
