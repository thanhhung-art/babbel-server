import {
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AuthService } from './auth.service';
import { Request } from 'src/types';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(@Inject() private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = await this.authService.verifyToken(req.cookies['authtoken']);
    if (token && token.sub && token.iat && token.exp) {
      req.user_id = token.sub;
      next();
    } else {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
