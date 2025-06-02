import { Module } from '@nestjs/common';
import { CreateMessageUseCase } from 'src/domain/application/use-cases/create-message.use-case';
import { DatabaseModule } from '../database/database.module';
import { MessagingModule } from '../messaging/messaging.module';
import { CreateMessageController } from './controllers/create-message/create-message.controller';

@Module({
  imports: [DatabaseModule, MessagingModule],
  controllers: [CreateMessageController],
  providers: [CreateMessageUseCase],
})
export class HttpModule {}
