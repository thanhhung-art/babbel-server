import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserActionService } from './services/user.action.service';
import { UserFriendService } from './services/user.friend.service';
import { UserConversationService } from './services/user.conversation.service';

const services = [
  UserService,
  UserActionService,
  UserFriendService,
  UserConversationService,
];

@Module({
  providers: services,
  controllers: [UserController],
  imports: [PrismaModule],
  exports: services,
})
export class UserModule {}
