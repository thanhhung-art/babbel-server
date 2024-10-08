import {
  Body,
  Controller,
  Get,
  Inject,
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
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject() private readonly userService: UserService,
  ) {}

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
      expires: new Date(Date.now() + 10 * 60 * 1000), // set 10m
      maxAge: 10 * 60 * 1000,
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

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshtoken'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }

    const newToken = await this.authService.refresh(refreshToken);

    res.cookie('authtoken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 30 * 1000),
      maxAge: 30 * 1000,
    });

    return res.json({ message: 'Token refreshed' });
  }

  @Get('user')
  async user(@Req() req: Request, @Res() res: Response) {
    const accessToken = req.cookies['authtoken'];
    const refreshToken = req.cookies['refreshtoken'];
    let newToken = '';
    let userId = '';

    // If refresh token exists, check if access token exists
    if (refreshToken) {
      if (accessToken) {
        const token = await this.authService.verifyToken(accessToken);
        // If access token is invalid, refresh the token
        if (!token) {
          newToken = (await this.authService.refresh(refreshToken)).newToken;
          userId = (await this.authService.refresh(refreshToken)).userId;
        } else {
          userId = token.sub;
        }
        // If access token doesn't exist, refresh the token
      } else {
        newToken = (await this.authService.refresh(refreshToken)).newToken;
        userId = (await this.authService.refresh(refreshToken)).userId;
      }
      // If refresh token doesn't exist, throw an error
    } else {
      throw new UnauthorizedException('No refresh token found');
    }

    let user: UserDto;
    if (userId || req.user_id) {
      const userEntity = await this.userService.findById(userId || req.user_id);
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
        expires: new Date(Date.now() + 10 * 60 * 1000),
        maxAge: 10 * 60 * 1000,
      });

    return res.json({
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      name: user.name,
    });
  }
}
