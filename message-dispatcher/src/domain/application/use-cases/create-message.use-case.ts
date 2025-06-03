import { Injectable } from '@nestjs/common';
import { Either, right } from 'src/core/either-pattern/either';
import {
  MessageEntity,
  MessageType,
} from 'src/domain/enterprise/entities/message.entity';
import { DispatcherService } from '../ports/dispatcher.service';
import { MessageRepository } from '../ports/message.repository';
import { MetricsPort } from '../ports/metrics.port';

export type CreateMessageUsecaseInput = {
  type: MessageType;
  destination: string;
  payload: Record<string, any>;
};

export type CreateMessageSuccessOutput = {
  id: string;
};

export type CreateMessageUsecaseOutput = Either<
  null,
  CreateMessageSuccessOutput
>;

@Injectable()
export class CreateMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dispatcherService: DispatcherService,
    private readonly metricsPort: MetricsPort,
  ) {}

  async execute(
    request: CreateMessageUsecaseInput,
  ): Promise<CreateMessageUsecaseOutput> {
    const message = MessageEntity.create({
      type: request.type,
      destination: request.destination,
      payload: request.payload,
    });

    await this.messageRepository.save(message);
    await this.dispatcherService.enqueueForProcessing(message);

    this.metricsPort.recordMessageCreated(request.type);

    return right({
      id: message.id.toString(),
    });
  }
}
