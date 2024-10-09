import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UserDto } from './auth.dto';
import { Response } from 'express';
import { Request } from 'src/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() data: RegisterDto) {
    return this.authService.signup(data);
  }

  @Post('login')
  async login(@Body() data: LoginDto, @Res() res: Response) {
    const { user, token, refreshToken } = await this.authService.login(data);

    res.cookie('authtoken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 5 * 60 * 1000), // set 5m
      maxAge: 5 * 60 * 1000,
    });

    res.cookie('refreshtoken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // set 7d
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/user',
    });

    return res.json(user);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('authtoken');
    res.clearCookie('refreshtoken');
    return res.json({ message: 'Logged out' });
  }

  @Get('user')
  async user(@Req() req: Request, @Res() res: Response) {
    const accessToken = req.cookies['authtoken'];
    const refreshToken = req.cookies['refreshtoken'];
    let newToken = '';
    let userId = '';

    if (accessToken) {
      try {
        // check time left
        const { sub, exp } = await this.authService.verifyToken(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = exp - currentTime;

        if (timeLeft <= 30) {
          const token = await this.authService.refresh(refreshToken);
          newToken = token.newToken;
          userId = token.userId;
        } else {
          userId = sub;
        }
      } catch (err) {
        if (refreshToken) {
          const token = await this.authService.refresh(refreshToken);
          newToken = token.newToken;
          userId = token.userId;
        } else {
          console.error(err);
          throw new UnauthorizedException('Invalid token');
        }
      }
    } else if (refreshToken) {
      const token = await this.authService.refresh(refreshToken);
      newToken = token.newToken;
      userId = token.userId;
    } else {
      throw new UnauthorizedException('No refresh token found');
    }

    let user: UserDto;
    if (userId) {
      const userEntity = await this.authService.findUserById(userId);
      user = {
        id: userEntity.id,
        email: userEntity.email,
        avatar: userEntity.avatar,
        name: userEntity.name,
      };
    } else {
      throw new NotFoundException('Not found user id');
    }

    if (newToken)
      res.cookie('authtoken', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(Date.now() + 5 * 60 * 1000),
        maxAge: 5 * 60 * 1000,
      });

    return res.json({
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      name: user.name,
    });
  }
}
