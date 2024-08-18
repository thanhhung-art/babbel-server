import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';

export class CustomSocketIoAdapter extends IoAdapter {
  constructor(app: INestApplication) {
    super(app);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Access-Control-Allow-Origin'],
        credentials: true,
      },
    });
    return server;
  }
}
