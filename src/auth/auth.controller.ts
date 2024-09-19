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
    const { user, token } = await this.authService.login(data);

    res.cookie('authtoken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json(user);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('authtoken');
    return res.json({ message: 'Logged out' });
  }

  @Get('user')
  async user(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies['authtoken'];
    if (!token) {
      throw new UnauthorizedException('No token found');
    }

    let user: UserDto;
    if (req.user_id) {
      user = await this.userService.findById(req.user_id);
    } else {
      throw new NotFoundException('Not found user id');
    }
    return res.json({ user });
  }
}
