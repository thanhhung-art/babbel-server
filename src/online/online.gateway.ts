import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnlineService } from './online.service';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({ namespace: 'online' })
export class OnlineGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly onlineService: OnlineService) {}

  @WebSocketServer() server: Server;

  handleConnection = async (client: Socket): Promise<void> => {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      try {
        await this.onlineService.saveUserOnlineStatus(userId, client.id);
      } catch (err) {
        console.error(err);
      }
    }

    const onlineFriends = await this.onlineService.getAllOnlineFriends(userId);

    onlineFriends.forEach((friend) => {
      this.server.to(friend.socketId).emit('online', userId);
    });

    client.emit(
      'online-friends',
      onlineFriends.map((friend) => friend.id),
    );

    console.log('Connected online friends:', onlineFriends);
  };

  handleDisconnect = async (client: Socket): Promise<void> => {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      try {
        await this.onlineService.removeUserOnlineStatus(userId);
      } catch (err) {
        console.error(err);
      }
    }

    const onlineFriends = await this.onlineService.getAllOnlineFriends(userId);
    if (!onlineFriends || onlineFriends.length === 0) return;

    onlineFriends.forEach((friend) => {
      this.server.to(friend.socketId).emit('offline', userId);
    });
  };
}
