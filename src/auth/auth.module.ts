import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from 'src/user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthMiddleware } from './auth.middleware';

@Module({
  providers: [AuthService, UserService, JwtService],
  controllers: [AuthController],
  imports: [
    PrismaModule,
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        await ConfigModule.envVariablesLoaded;
        return {
          global: true,
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude('/auth/login', '/auth/signup')
      .forRoutes('*');
  }
}
