import { Module } from '@nestjs/common';
import { CreateMessageUseCase } from 'src/domain/application/use-cases/create-message.use-case';
import { GetMessageByIdUseCase } from 'src/domain/application/use-cases/get-message-by-id.use-case';
import { DatabaseModule } from '../database/database.module';
import { MessagingModule } from '../messaging/messaging.module';
import { CreateMessageController } from './controllers/create-message/create-message.controller';
import { GetMessageByIdController } from './controllers/get-message-by-id/get-message-by-id.controller';
import { ResourceNotFoundFilterProvider } from './filters/resource-not-found.filter';

const filters = [ResourceNotFoundFilterProvider];

@Module({
  imports: [DatabaseModule, MessagingModule],
  controllers: [CreateMessageController, GetMessageByIdController],
  providers: [CreateMessageUseCase, GetMessageByIdUseCase, ...filters],
})
export class HttpModule {}
