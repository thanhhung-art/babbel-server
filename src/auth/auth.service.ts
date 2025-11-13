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
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

@Injectable()
export class AuthService {
  private OAuth2 = google.auth.OAuth2;
  private oauth2Client = new this.OAuth2(
    process.env.EMAIL_CLIENT_ID,
    process.env.EMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground',
  );

  constructor(
    @Inject() private readonly userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createTranporter() {
    this.oauth2Client.setCredentials({
      refresh_token: process.env.EMAIL_REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
      this.oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject('Failed to create access token');
        }
        resolve(token);
      });
    });

    const tranporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.EMAIL_CLIENT_ID,
        clientSecret: process.env.EMAIL_CLIENT_SECRET,
        refreshToken: process.env.EMAIL_REFRESH_TOKEN,
        accessToken: accessToken as string,
      },
    });

    return tranporter;
  }

  async sendMail(email: string, token: string) {
    try {
      const emailTranporter = await this.createTranporter();
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Test email with OAuth2',
        html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:5173/reset-password?token=${token}">link</a> to reset your password</p>
        <p>This link will expire in 3 minutes</p>
        `,
      };
      const result = await emailTranporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      return error;
    }
  }

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
        expiresIn: '5m',
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
          expiresIn: '5m',
        },
      );
      return { newToken, userId: decoded.sub };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async findUserById(id: string) {
    return this.userService.findById(id);
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '3m',
      },
    );

    await this.sendMail(email, token);

    // TODO: Implement password reset logic
    return { message: 'Password reset link sent' };
  }

  async resetPassword(userId: string, newPassword: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    //await this.userService.updatePassword(userId, newPassword);

    return { message: 'Password has been reset successfully' };
  }
}
