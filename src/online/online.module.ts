import { Module, forwardRef } from '@nestjs/common';
import { OnlineService } from './online.service';
import { OnlineGateway } from './online.gateway';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [],
  providers: [OnlineService, OnlineGateway],
  exports: [OnlineService, OnlineGateway],
})
export class OnlineModule {}
