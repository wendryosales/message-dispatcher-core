import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DispatcherService } from 'src/domain/application/ports/dispatcher.service';
import { ProcessMessageUseCase } from 'src/domain/application/use-cases/process-message.use-case';
import { DatabaseModule } from '../database/database.module';
import { MessageProcessorConsumer } from './kafka/consumers/message-processor.consumer';
import { KafkaDispatcherServiceProvider } from './kafka/services/kafka-dispatcher.service';
import { EmailNotifierService } from './notifiers/email-notifier.service';
import { HttpNotifierService } from './notifiers/http-notifier.service';
import { NotifierFactory } from './notifiers/notifier.factory';
import {
  NotifierService,
  NotifierServiceProvider,
} from './notifiers/notifier.service';

@Module({
  imports: [
    DatabaseModule,
    HttpModule.register({
      timeout: 10000, // 10 segundos
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Message-Dispatcher/1.0',
      },
    }),
  ],
  providers: [
    // Use Cases
    ProcessMessageUseCase,
    // Notifiers
    HttpNotifierService,
    EmailNotifierService,
    NotifierFactory,
    NotifierService,
    NotifierServiceProvider,
    // Services
    KafkaDispatcherServiceProvider,
    MessageProcessorConsumer,
  ],
  exports: [DispatcherService],
})
export class MessagingModule {}
