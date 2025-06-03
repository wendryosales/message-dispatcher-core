import { ResourceNotFoundError } from 'src/core/errors/resource-not-found.error';
import {
  MessageEntity,
  MessageType,
} from 'src/domain/enterprise/entities/message.entity';
import { MockMetricsAdapter } from 'test/adapters/mock-metrics.adapter';
import { InMemoryMessageRepository } from 'test/repositories/in-memory-message.repository';
import { MockDispatcherService } from 'test/services/mock-dispatcher.service';
import {
  MessageCannotBeRetriedError,
  RetryMessageUseCase,
} from './retry-message.use-case';

describe('RetryMessageUseCase', () => {
  let sut: RetryMessageUseCase;
  let messageRepository: InMemoryMessageRepository;
  let dispatcherService: MockDispatcherService;
  let metricsAdapter: MockMetricsAdapter;

  beforeEach(() => {
    messageRepository = new InMemoryMessageRepository();
    dispatcherService = new MockDispatcherService();
    metricsAdapter = new MockMetricsAdapter();
    sut = new RetryMessageUseCase(
      messageRepository,
      dispatcherService,
      metricsAdapter,
    );
  });

  it('should retry a failed message', async () => {
    // Arrange
    const message = MessageEntity.create({
      type: MessageType.HTTP,
      destination: 'http://example.com',
      payload: { test: 'data' },
    });

    // Simula uma mensagem que falhou após 3 tentativas
    message.incrementAttempts();
    message.incrementAttempts();
    message.incrementAttempts();
    message.markFailed('Previous error');
    await messageRepository.save(message);

    const enqueueSpy = jest.spyOn(dispatcherService, 'enqueueForProcessing');
    const metricsRecordSpy = jest.spyOn(metricsAdapter, 'recordMessageRetried');

    // Act
    const result = await sut.execute({
      id: message.id.toString(),
    });

    // Assert
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual({
        success: true,
        message: `Message ${message.id.toString()} queued for retry`,
      });
    }

    const updatedMessage = await messageRepository.findById(
      message.id.toString(),
    );
    expect(updatedMessage?.status).toBe('pending');
    expect(updatedMessage?.attempts).toBe(0);
    expect(updatedMessage?.reason).toBeUndefined();

    expect(enqueueSpy).toHaveBeenCalledWith(expect.any(MessageEntity));
    expect(metricsRecordSpy).toHaveBeenCalledWith(MessageType.HTTP);
  });

  it('should return ResourceNotFoundError when message does not exist', async () => {
    // Act
    const result = await sut.execute({
      id: 'non-existent-id',
    });

    // Assert
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe(
        'Message with id non-existent-id not found',
      );
    }
  });

  it('should return MessageCannotBeRetriedError when message cannot be retried', async () => {
    // Arrange
    const message = MessageEntity.create({
      type: MessageType.HTTP,
      destination: 'http://example.com',
      payload: { test: 'data' },
    });

    // Simula uma mensagem que ainda está em processamento
    message.incrementAttempts();
    message.markProcessing();
    await messageRepository.save(message);

    // Act
    const result = await sut.execute({
      id: message.id.toString(),
    });

    // Assert
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(MessageCannotBeRetriedError);
      expect(result.value.message).toBe(
        'Message cannot be retried. Status: processing, Attempts: 1',
      );
    }
  });

  it('should not allow retry of successful messages', async () => {
    // Arrange
    const message = MessageEntity.create({
      type: MessageType.HTTP,
      destination: 'http://example.com',
      payload: { test: 'data' },
    });

    message.markSuccess();
    await messageRepository.save(message);

    // Act
    const result = await sut.execute({
      id: message.id.toString(),
    });

    // Assert
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(MessageCannotBeRetriedError);
    }
  });
});
