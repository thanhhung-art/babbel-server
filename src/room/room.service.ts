import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ICreateRoom } from './room.types';

@Injectable()
export class RoomService {
  constructor(@Inject() private readonly prismaService: PrismaService) {}

  async create(data: ICreateRoom) {
    const roomCreated = await this.prismaService.room.create({
      data: {
        name: data.name,
        avatar: data.avatar,
      },
    });

    await this.prismaService.roomAdmin.create({
      data: {
        userId: data.userId,
        roomId: roomCreated.id,
      },
    });

    await this.prismaService.roomMember.create({
      data: {
        userId: data.userId,
        roomId: roomCreated.id,
        role: 'ADMIN',
      },
    });

    return roomCreated;
  }

  async findAll() {
    return await this.prismaService.room.findMany();
  }

  async findOneById(id: string) {
    return await this.prismaService.room.findUnique({
      where: { id },
    });
  }

  async findRommByUserId(userId: string) {
    return await this.prismaService.room.findMany({
      where: { members: { some: { userId } } },
    });
  }

  async findByName(name: string) {
    return await this.prismaService.room.findMany({
      where: { name: { contains: name } },
      select: {
        id: true,
        name: true,
        avatar: true,
        createdAt: true,
        updateAt: true,
      },
    });
  }

  async getMessagesByRoomId(roomId: string) {
    const messages = await this.prismaService.messageInRoom.findMany({
      where: { roomId },
      include: {
        user: { select: { name: true } },
        files: { select: { url: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages;
  }

  async addToChatting(userId: string, roomId: string) {
    const existingChatting = await this.prismaService.chatting.findFirst({
      where: {
        userId,
        roomId,
      },
    });

    if (existingChatting) {
      return 'Already added to chatting';
    }

    return await this.prismaService.chatting.create({
      data: {
        userId,
        roomId,
      },
    });
  }

  async requestJoinRoom(userId: string, roomId: string) {
    const existingRoomMember = await this.prismaService.roomMember.findFirst({
      where: { userId, roomId },
    });

    if (existingRoomMember) {
      return 'Already joined';
    }

    const existingJoinRequest = await this.prismaService.joinRequest.findFirst({
      where: { userId, roomId },
    });

    if (existingJoinRequest) {
      return 'Already requested';
    }

    return await this.prismaService.joinRequest.create({
      data: {
        userId,
        roomId,
      },
    });
  }

  async deleteRoom(id: string) {
    await this.prismaService.roomAdmin.deleteMany({
      where: { roomId: id },
    });

    await this.prismaService.roomMember.deleteMany({
      where: { roomId: id },
    });

    return await this.prismaService.room.delete({
      where: { id },
    });
  }
}
