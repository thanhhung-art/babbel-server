import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ICreateUser } from 'src/user/user.type';
import { UserService } from 'src/user/user.service';
import { ILogin } from './auth.types';
import { verifyPassword } from 'src/utils/crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject() private readonly userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(data: ICreateUser) {
    const user = await this.userService.create(data);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, salt, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(data: ILogin) {
    const user = await this.userService.findByEmail(data.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = verifyPassword(
      data.password,
      user.salt,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, salt, ...userWithoutPassword } = user;

    const token = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '10m',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  async verifyAndReturnUser(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      const user = await this.userService.findById(decoded.sub);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async verifyToken(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync<{
        sub: string;
        iat: number;
        exp: number;
      }>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return decoded;
    } catch (error) {
      return null;
    }
  }

  async logout() {
    return { message: 'Logout success' };
  }

  async refresh(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync<{
        sub: string;
        iat: number;
        exp: number;
      }>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const newToken = await this.jwtService.signAsync(
        { sub: decoded.sub },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '10m',
        },
      );
      return { newToken, userId: decoded.sub };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
