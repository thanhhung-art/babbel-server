import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomSocketIoAdapter } from './socket/custom-socket-io.adapter';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.disable('x-powered-by');

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
      'x-file-name',
      'x-chunk-index',
      'x-total-chunks',
      'x-file-type',
      'x-file-size',
    ],
    credentials: true,
  });

  app.use((req, res, next) => {
    res.header('X-Powered-By', null);
    next();
  });

  await app.listen(3000);
}
bootstrap();
