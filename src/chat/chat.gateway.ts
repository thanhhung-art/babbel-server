import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { ChatService } from './chat.service';
import { ICreateMessage } from './type';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer() server: Server;

  private readonly tempChunks: {
    [key: string]: { chunks: ArrayBuffer[]; totalChunks: number; type: string };
  } = {};

  constructor(
    @Inject() private readonly userService: UserService,
    @Inject() private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      try {
        await this.userService.createUserOnline(userId, client.id);
      } catch (err) {
        console.error(err);
      }
    }

    const onlineFriends = await this.userService.getFriendsOnline(userId);

    onlineFriends.forEach((friend) => {
      this.server.to(friend.socketId).emit('online', userId);
    });

    client.emit(
      'online-friends',
      onlineFriends.map((friend) => friend.id),
    );
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      try {
        await this.userService.deleteUserOnline(userId);
      } catch (err) {
        console.error(err);
      }
    }

    const onlineFriends = await this.userService.getFriendsOnline(userId);

    onlineFriends.forEach((friend) => {
      this.server.to(friend.socketId).emit('offline', userId);
    });
  }

  @SubscribeMessage('send-message-to-user')
  async handleMessage(
    @MessageBody()
    {
      conversationId,
      friendId,
      content,
    }: { conversationId: string; content: string; friendId: string },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.handshake.query.userId as string;
    const friendSocket = await this.userService.getUserSocketId(friendId);
    const saveMessage = await this.chatService.createMessage({
      content,
      userId,
      conversationId,
    });
    this.server.to(friendSocket).emit('new-message-from-friend', saveMessage);
    client.emit('new-message-from-friend', saveMessage);
  }

  @SubscribeMessage('typing-message-to-friend')
  async handleTypingMessage(
    @MessageBody()
    {
      conversationId,
      friendId,
      isTyping,
    }: { conversationId: string; friendId: string; isTyping: boolean },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const friendSocket = await this.userService.getUserSocketId(friendId);

    if (friendSocket) {
      this.server
        .to(friendSocket)
        .emit('friend-typing-message', { conversationId, isTyping });
    }
  }

  @SubscribeMessage('update-message-in-conversation')
  async handleUpdateMessageInConversation(
    @MessageBody()
    {
      messId,
      value,
      friendId,
    }: {
      messId: string;
      value: string;
      friendId: string;
    },
    //@ConnectedSocket() client: Socket,
  ): Promise<void> {
    const friendSocket = await this.userService.getUserSocketId(friendId);
    const message = await this.chatService.updateMessageInConversation(
      messId,
      value,
    );

    if (friendSocket) {
      this.server
        .to(friendSocket)
        .emit('update-message-in-conversation', message);
    }
  }

  @SubscribeMessage('delete-message-in-conversation')
  async handleDeleteMessageInConversation(
    @MessageBody()
    { messId, friendId }: { messId: string; friendId: string },
    //@ConnectedSocket() client: Socket,
  ): Promise<void> {
    const friendSocket = await this.userService.getUserSocketId(friendId);
    const deletedMessage =
      await this.chatService.deleteMessageInConversation(messId);

    if (friendSocket) {
      this.server
        .to(friendSocket)
        .emit(
          'delete-message-in-conversation',
          messId,
          deletedMessage.conversationId,
        );
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    client.join(roomId);
  }

  @SubscribeMessage('send-message-to-room')
  async handleMessageToRoom(
    @MessageBody()
    {
      roomId,
      content,
      files,
    }: {
      roomId: string;
      content: string;
      files?: string[];
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.handshake.query.userId as string;
    const dataToCreateMessage: ICreateMessage = {
      content,
      userId,
      roomId,
    };

    if (files) {
      dataToCreateMessage.files = files;
    }

    const saveMessage =
      await this.chatService.createMessageInRoom(dataToCreateMessage);

    this.server.to(roomId).emit('new-message-to-room', saveMessage);
  }

  @SubscribeMessage('update-message-in-room')
  async handleUpdateMessageInRoom(
    @MessageBody()
    {
      messId,
      value,
      roomId,
    }: { messId: string; value: string; roomId: string },
    //@ConnectedSocket() client: Socket,
  ): Promise<void> {
    const message = await this.chatService.updateMessageInRoom(messId, value);
    this.server.to(roomId).emit('update-message-in-room', message);
  }

  @SubscribeMessage('delete-message-in-room')
  async handleDeleteMessageInRoom(
    @MessageBody() { messId, roomId }: { messId: string; roomId: string },
    //@ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.chatService.deleteMessageInRoom(messId);
    this.server.to(roomId).emit('delete-message-in-room', messId, roomId);
  }

  @SubscribeMessage('file-upload')
  handleChunk(
    @MessageBody()
    data: {
      messageAttachmentId: string;
      filePayload: {
        chunk: ArrayBuffer;
        index: number;
        totalChunks: number;
        fileName: string;
        size: number;
        type: string;
      };
    },
    @ConnectedSocket() client: Socket,
  ): void {
    const { chunk, index, totalChunks, fileName, type } = data.filePayload;

    if (!this.tempChunks[fileName]) {
      this.tempChunks[fileName] = { chunks: [], totalChunks, type };
    }

    this.tempChunks[fileName].chunks[index] = chunk;

    if (this.tempChunks[fileName].chunks.length === totalChunks) {
      const completeBuffer = this.concatChunks(
        this.tempChunks[fileName].chunks,
      );

      this.chatService.saveFile({
        data: completeBuffer,
        type: type,
        messageAttachmentId: data.messageAttachmentId,
        fileName,
      });
      delete this.tempChunks[fileName];

      client.emit('upload-file-success', fileName);
    }
  }

  private concatChunks(chunks: ArrayBuffer[]): ArrayBuffer {
    const totalLength = chunks.reduce(
      (acc, chunk) => acc + chunk.byteLength,
      0,
    );
    const combinedBuffer = Buffer.alloc(totalLength);
    let offset = 0;

    chunks.forEach((chunk) => {
      const bufferChunk = Buffer.from(chunk);
      bufferChunk.copy(combinedBuffer, offset);
      offset += bufferChunk.length;
    });

    return combinedBuffer;
  }
}
