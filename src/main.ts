import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomSocketIoAdapter } from './socket/custom-socket-io.adapter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useWebSocketAdapter(new CustomSocketIoAdapter(app));
  app.enableCors({
    origin: ['http://localhost:5173', 'https://www.thunderclient.io'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials',
      'Access-Control-Allow-Headers',
      'Content-Type',
    ],
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
