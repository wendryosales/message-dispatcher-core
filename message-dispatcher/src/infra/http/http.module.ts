import { Module } from '@nestjs/common';
import { CreateMessageUseCase } from 'src/domain/application/use-cases/create-message.use-case';
import { GetMessageByIdUseCase } from 'src/domain/application/use-cases/get-message-by-id.use-case';
import { RetryMessageUseCase } from 'src/domain/application/use-cases/retry-message.use-case';
import { DatabaseModule } from '../database/database.module';
import { MessagingModule } from '../messaging/messaging.module';
import { CreateMessageController } from './controllers/create-message/create-message.controller';
import { GetMessageByIdController } from './controllers/get-message-by-id/get-message-by-id.controller';
import { HealthController } from './controllers/health.controller';
import { RetryMessageController } from './controllers/retry-message/retry-message.controller';
import { MessageCannotBeRetriedFilterProvider } from './filters/message-cannot-be-retried.filter';
import { ResourceNotFoundFilterProvider } from './filters/resource-not-found.filter';

const filters = [
  ResourceNotFoundFilterProvider,
  MessageCannotBeRetriedFilterProvider,
];

@Module({
  imports: [DatabaseModule, MessagingModule],
  controllers: [
    CreateMessageController,
    GetMessageByIdController,
    RetryMessageController,
    HealthController,
  ],
  providers: [
    CreateMessageUseCase,
    GetMessageByIdUseCase,
    RetryMessageUseCase,
    ...filters,
  ],
})
export class HttpModule {}
