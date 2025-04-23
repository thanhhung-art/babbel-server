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
import { ICreateMessageInConversation, ICreateMessageInRoom } from './type';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer() server: Server;

  private readonly tempChunks: {
    [key: string]: { chunks: ArrayBuffer[]; totalChunks: number; type: string };
  } = {};

  constructor(
    @Inject() private readonly userService: UserService,
    @Inject() private readonly chatService: ChatService,
  ) {}

  async handleConnection(): Promise<void> {}

  async handleDisconnect(): Promise<void> {}

  @SubscribeMessage('send-message-to-user')
  async handleMessage(
    @MessageBody()
    {
      conversationId,
      friendId,
      content,
      urls,
    }: {
      conversationId: string;
      content: string;
      friendId: string;
      urls: string[];
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.handshake.query.userId as string;
    const isBlocked = await this.chatService.checkIfFriendBlocked(
      friendId,
      userId,
    );

    if (isBlocked) {
      return;
    }

    const dataToCreateMessage: ICreateMessageInConversation = {
      content,
      userId,
      conversationId,
    };

    if (urls.length > 0) {
      dataToCreateMessage.files = urls;
    }

    const friendSocket = await this.userService.getUserSocketId(friendId);
    const saveMessage =
      await this.chatService.createMessage(dataToCreateMessage);
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
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.handshake.query.userId as string;
    const isBlocked = await this.chatService.checkIfFriendBlocked(
      friendId,
      userId,
    );
    if (isBlocked) {
      return;
    }
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
      urls,
    }: {
      roomId: string;
      content: string;
      urls: string[];
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.handshake.query.userId as string;
    const dataToCreateMessage: ICreateMessageInRoom = {
      content,
      userId,
      roomId,
    };

    if (urls.length > 0) {
      dataToCreateMessage.files = urls;
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
