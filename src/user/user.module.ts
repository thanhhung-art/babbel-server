import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserActionService } from './services/user.action.service';
import { UserFriendService } from './services/user.friend.service';
import { UserConversationService } from './services/user.conversation.service';
import { OnlineModule } from 'src/online/online.module';

const services = [
  UserService,
  UserActionService,
  UserFriendService,
  UserConversationService,
];

@Module({
  imports: [PrismaModule, forwardRef(() => OnlineModule)],
  providers: [...services],
  controllers: [UserController],
  exports: services,
})
export class UserModule {}
