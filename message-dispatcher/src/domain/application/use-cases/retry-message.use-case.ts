import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'src/core/either-pattern/either';
import { ResourceNotFoundError } from 'src/core/errors/resource-not-found.error';
import { DispatcherService } from '../ports/dispatcher.service';
import { MessageRepository } from '../ports/message.repository';
import { MetricsPort } from '../ports/metrics.port';

export interface RetryMessageInput {
  id: string;
}

export class MessageCannotBeRetriedError extends Error {
  constructor(status: string, attempts: number) {
    super(
      `Message cannot be retried. Status: ${status}, Attempts: ${attempts}`,
    );
    this.name = 'MessageCannotBeRetriedError';
  }
}

export type RetryMessageOutput = {
  success: boolean;
  message: string;
};

export type RetryMessageResult = Either<
  ResourceNotFoundError | MessageCannotBeRetriedError,
  RetryMessageOutput
>;

@Injectable()
export class RetryMessageUseCase {
  constructor(
    private readonly repository: MessageRepository,
    private readonly dispatcher: DispatcherService,
    private readonly metricsPort: MetricsPort,
  ) {}

  async execute(input: RetryMessageInput): Promise<RetryMessageResult> {
    const message = await this.repository.findById(input.id);

    if (!message) {
      return left(
        new ResourceNotFoundError(`Message with id ${input.id} not found`),
      );
    }

    if (!message.canBeManuallyRetried()) {
      return left(
        new MessageCannotBeRetriedError(message.status, message.attempts),
      );
    }

    message.retry();
    await this.repository.save(message);
    await this.dispatcher.enqueueForProcessing(message);

    this.metricsPort.recordMessageRetried(message.type);

    return right({
      success: true,
      message: `Message ${input.id} queued for retry`,
    });
  }
}
