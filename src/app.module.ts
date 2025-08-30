import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { GroupMessageModule } from './group-message/group-message.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [AuthModule, GroupModule, GroupMessageModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
