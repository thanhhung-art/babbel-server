import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();

    const userId = request.user_id;
    const url = request.url;

    if (userId) {
      return `cache_${url}_user_${userId}`;
    }

    return super.trackBy(context);
  }
}
