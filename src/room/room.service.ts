import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ICreateRoom, IUpdateRoomData, IUpdateRoomParams } from './room.types';

@Injectable()
export class RoomService {
  constructor(@Inject() private readonly prismaService: PrismaService) {}

  async create(data: ICreateRoom) {
    const roomCreated = await this.prismaService.room.create({
      data: {
        name: data.name,
        avatar: data.avatar,
        public: data.isPublic,
        description: data.description,
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

    await this.prismaService.chatting.create({
      data: {
        userId: data.userId,
        roomId: roomCreated.id,
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
    if (!name) {
      return [];
    }

    return await this.prismaService.room.findMany({
      where: {
        name: { contains: name },
      },
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

  async getMembersByRoomId(roomId: string) {
    return await this.prismaService.roomMember.findMany({
      where: { roomId },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });
  }

  async getJoinRequestsByRoomId(roomId: string) {
    return await this.prismaService.joinRequest.findMany({
      where: { roomId },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });
  }

  async addToChatting(userId: string, roomId: string) {
    const existingChatting = await this.prismaService.chatting.findFirst({
      where: {
        userId,
        roomId,
      },
    });

    if (existingChatting) {
      return { msg: 'Already added' };
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
      return { msg: 'Already joined' };
    }

    const existingJoinRequest = await this.prismaService.joinRequest.findFirst({
      where: { id: userId, roomId },
    });

    if (existingJoinRequest) {
      return { msg: 'Already requested' };
    }

    const existingBannedUser = await this.prismaService.bannedUser.findFirst({
      where: { userId, roomId },
    });

    if (existingBannedUser) {
      return { msg: 'You are banned' };
    }

    return await this.prismaService.joinRequest.create({
      data: {
        userId,
        roomId,
      },
    });
  }

  async acceptJoinRequest(userId: string, roomId: string) {
    const existingJoinRequest = await this.prismaService.joinRequest.findFirst({
      where: { userId, roomId },
    });

    if (!existingJoinRequest) {
      return { msg: 'No request found' };
    }

    await this.prismaService.roomMember.create({
      data: {
        userId,
        roomId,
        role: 'MEMBER',
      },
    });

    await this.prismaService.chatting.create({
      data: {
        userId,
        roomId,
      },
    });

    await this.prismaService.joinRequest.delete({
      where: { id: existingJoinRequest.id },
    });

    return { msg: 'Request accepted' };
  }

  async rejectJoinRequest(userId: string, roomId: string) {
    const existingJoinRequest = await this.prismaService.joinRequest.findFirst({
      where: { userId, roomId },
    });

    if (!existingJoinRequest) {
      return { msg: 'No request found' };
    }

    await this.prismaService.joinRequest.delete({
      where: { id: existingJoinRequest.id },
    });

    return { msg: 'Request rejected' };
  }

  async kickUser(userId: string, roomId: string) {
    await this.prismaService.chatting.deleteMany({
      where: { userId, roomId },
    });

    return await this.prismaService.roomMember.deleteMany({
      where: { userId, roomId },
    });
  }

  async banUser(userId: string, roomId: string) {
    await this.prismaService.chatting.deleteMany({
      where: { userId, roomId },
    });

    await this.prismaService.roomMember.deleteMany({
      where: { userId, roomId },
    });

    await this.prismaService.bannedUser.create({
      data: {
        userId,
        roomId,
      },
    });

    return { msg: 'User banned' };
  }

  async getBannedUsersByRoomId(roomId: string) {
    return await this.prismaService.bannedUser.findMany({
      where: { roomId },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });
  }

  async getTotalMembersByRoomId(roomId: string) {
    return await this.prismaService.roomMember.count({
      where: { roomId },
    });
  }

  async getTotalJoinRequestsByRoomId(roomId: string) {
    return await this.prismaService.joinRequest.count({
      where: { roomId },
    });
  }

  async getTotalBannedUsersByRoomId(roomId: string) {
    return await this.prismaService.bannedUser.count({
      where: { roomId },
    });
  }

  async unbanUser(userId: string, roomId: string) {
    await this.prismaService.bannedUser.deleteMany({
      where: { userId, roomId },
    });
    return { msg: 'User unbanned' };
  }

  async checkRoomAdmin(userId: string, roomId: string) {
    const result = await this.prismaService.roomAdmin.findFirst({
      where: { userId, roomId },
    });

    return !!result;
  }

  async getRoomInfo(roomId: string) {
    const room = await this.prismaService.room.findUnique({
      where: { id: roomId },
    });

    return {
      name: room.name,
      avatar: room.avatar,
      isPublic: room.public,
      description: room.description,
    };
  }

  async updateRoom({
    id,
    name,
    description,
    avatar,
    isPublic,
    adminId,
  }: IUpdateRoomParams) {
    const isAdmin = await this.checkRoomAdmin(adminId, id);
    if (!isAdmin) {
      throw new BadRequestException('Only admins can update the room');
    }

    const dataToUpdate: IUpdateRoomData = {};

    if (name) dataToUpdate.name = name;
    if (avatar) dataToUpdate.avatar = avatar;
    if (isPublic) dataToUpdate.isPublic = isPublic;
    if (description) dataToUpdate.description = description;
    console.log(dataToUpdate);

    await this.prismaService.room.update({
      where: { id },
      data: dataToUpdate,
    });

    return 'Room updated';
  }

  async deleteRoom(id: string) {
    const room = await this.prismaService.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new BadRequestException('Room not found');
    }

    await this.prismaService.roomAdmin.deleteMany({
      where: { roomId: id },
    });

    await this.prismaService.roomMember.deleteMany({
      where: { roomId: id },
    });

    await this.prismaService.chatting.deleteMany({
      where: { roomId: id },
    });

    await this.prismaService.joinRequest.deleteMany({
      where: { roomId: id },
    });

    await this.prismaService.bannedUser.deleteMany({
      where: { roomId: id },
    });

    await this.prismaService.messageInRoom.deleteMany({
      where: { roomId: id },
    });

    return await this.prismaService.room.delete({
      where: { id },
    });
  }
}
