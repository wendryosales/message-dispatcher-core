import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'src/core/either-pattern/either';
import { DispatcherService } from '../ports/dispatcher.service';
import { MessageRepository } from '../ports/message.repository';
import { NotifierPort } from '../ports/notifier.port';
import { MessageNotFoundError } from './errors/message-not-found.error';

export interface ProcessMessageInput {
  id: string;
}

export type ProcessMessageOutput = Either<
  MessageNotFoundError,
  { success: boolean }
>;

@Injectable()
export class ProcessMessageUseCase {
  constructor(
    private readonly repository: MessageRepository,
    private readonly notifier: NotifierPort,
    private readonly dispatcher: DispatcherService,
  ) {}

  async execute(input: ProcessMessageInput): Promise<ProcessMessageOutput> {
    const message = await this.repository.findById(input.id);

    if (!message) {
      return left(
        new MessageNotFoundError(`Message with id ${input.id} not found`),
      );
    }

    message.markProcessing();
    await this.repository.save(message);

    try {
      await this.notifier.send(message);
      message.markSuccess();
      await this.repository.save(message);
      return right({ success: true });
    } catch (error) {
      message.incrementAttempts();

      if (!message.canRetry()) {
        message.markFailed(error.message);
        await this.repository.save(message);
        return right({ success: false });
      }

      try {
        await this.dispatcher.enqueueForProcessing(message);
      } catch (dispatchError) {
        message.markFailed(
          `Retry dispatch failed: ${dispatchError.message}. Original error: ${error.message}`,
        );
      }

      await this.repository.save(message);
      return right({ success: true });
    }
  }
}
