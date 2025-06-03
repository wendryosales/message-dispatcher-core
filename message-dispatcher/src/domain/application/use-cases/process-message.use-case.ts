import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'src/core/either-pattern/either';
import { ResourceNotFoundError } from 'src/core/errors/resource-not-found.error';
import { NotifierPort } from 'src/domain/application/ports/notifier.port';
import { DispatcherService } from '../ports/dispatcher.service';
import { MessageRepository } from '../ports/message.repository';
import { MetricsPort } from '../ports/metrics.port';

export type ProcessMessageInput = {
  id: string;
};

export type ProcessMessageOutput = Either<
  ResourceNotFoundError,
  { success: boolean }
>;

@Injectable()
export class ProcessMessageUseCase {
  constructor(
    private readonly repository: MessageRepository,
    private readonly notifier: NotifierPort,
    private readonly dispatcher: DispatcherService,
    private readonly metricsPort: MetricsPort,
  ) {}

  async execute(input: ProcessMessageInput): Promise<ProcessMessageOutput> {
    const startTime = Date.now();
    const message = await this.repository.findById(input.id);

    if (!message) {
      return left(
        new ResourceNotFoundError(`Message with id ${input.id} not found`),
      );
    }

    message.markProcessing();
    await this.repository.save(message);

    try {
      const timeoutInSeconds = message.backoffTimeout();
      await this.notifier.send(message, timeoutInSeconds);
      message.markSuccess();
      await this.repository.save(message);

      // Record success metrics
      const duration = (Date.now() - startTime) / 1000;
      this.metricsPort.recordMessageProcessingDuration(message.type, duration);
      this.metricsPort.recordMessageProcessed(message.type, 'success');

      return right({ success: true });
    } catch (error) {
      message.incrementAttempts();

      if (!message.canBeAutomaticallyRetried()) {
        message.markFailed(error.message);
        await this.repository.save(message);

        // Record failure metrics
        const duration = (Date.now() - startTime) / 1000;
        this.metricsPort.recordMessageProcessingDuration(
          message.type,
          duration,
        );
        this.metricsPort.recordMessageProcessed(message.type, 'failed');
        this.metricsPort.recordMessageFailed(
          message.type,
          error.name || 'unknown',
        );

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

      // Record retry metrics
      const duration = (Date.now() - startTime) / 1000;
      this.metricsPort.recordMessageProcessingDuration(message.type, duration);
      this.metricsPort.recordMessageProcessed(message.type, 'retry');

      return right({ success: true });
    }
  }
}
