import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();

    const userId = request.user_id;
    const url = request.url;

    if (request.method !== 'GET') {
      return undefined;
    }

    if (url.includes('/api/auth/user')) {
      return undefined;
    }

    // Include userId for authentication and user-related queries
    if (url.includes('/auth') || url.includes('/user')) {
      if (userId) {
        return `cache_${url}_user_${userId}`;
      }
    }

    // Include roomId for room-related queries
    if (url.includes('/room')) {
      return `cache_${url}`;
    }

    return super.trackBy(context);
  }
}
