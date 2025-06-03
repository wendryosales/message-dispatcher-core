import { ResourceNotFoundError } from 'src/core/errors/resource-not-found.error';
import {
  MessageEntity,
  MessageType,
} from 'src/domain/enterprise/entities/message.entity';
import { MockMetricsAdapter } from 'test/adapters/mock-metrics.adapter';
import { MockNotifierAdapter } from 'test/adapters/mock-notifier.adapter';
import { InMemoryMessageRepository } from 'test/repositories/in-memory-message.repository';
import { MockDispatcherService } from 'test/services/mock-dispatcher.service';
import { ProcessMessageUseCase } from './process-message.use-case';

describe('ProcessMessageUseCase', () => {
  let sut: ProcessMessageUseCase;
  let messageRepository: InMemoryMessageRepository;
  let notifier: MockNotifierAdapter;
  let dispatcher: MockDispatcherService;
  let metricsPort: MockMetricsAdapter;

  beforeEach(() => {
    messageRepository = new InMemoryMessageRepository();
    notifier = new MockNotifierAdapter();
    dispatcher = new MockDispatcherService();
    metricsPort = new MockMetricsAdapter();
    sut = new ProcessMessageUseCase(
      messageRepository,
      notifier,
      dispatcher,
      metricsPort,
    );
  });

  it('should return ResourceNotFoundError when message does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existent-id',
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe(
        'Message with id non-existent-id not found',
      );
    }
  });

  it('should process message successfully', async () => {
    // Arrange
    const message = MessageEntity.create({
      type: MessageType.HTTP,
      destination: 'http://example.com',
      payload: { test: 'data' },
    });
    await messageRepository.save(message);

    const processingDurationSpy = jest.spyOn(
      metricsPort,
      'recordMessageProcessingDuration',
    );
    const processedSpy = jest.spyOn(metricsPort, 'recordMessageProcessed');

    // Act
    const result = await sut.execute({
      id: message.id.toString(),
    });

    // Assert
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.success).toBe(true);
    }

    const updatedMessage = await messageRepository.findById(
      message.id.toString(),
    );
    expect(updatedMessage?.status).toBe('success');
    expect(updatedMessage?.attempts).toBe(0);

    expect(processingDurationSpy).toHaveBeenCalledWith(
      MessageType.HTTP,
      expect.any(Number),
    );
    expect(processedSpy).toHaveBeenCalledWith(MessageType.HTTP, 'success');
  });

  it('should retry message automatically when processing fails and attempts < 3', async () => {
    // Arrange
    const message = MessageEntity.create({
      type: MessageType.HTTP,
      destination: 'http://example.com',
      payload: { test: 'data' },
    });
    await messageRepository.save(message);

    const error = new Error('Processing failed');
    jest.spyOn(notifier, 'send').mockRejectedValueOnce(error);

    const enqueueSpy = jest.spyOn(dispatcher, 'enqueueForProcessing');
    const processedSpy = jest.spyOn(metricsPort, 'recordMessageProcessed');

    // Act
    const result = await sut.execute({
      id: message.id.toString(),
    });

    // Assert
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.success).toBe(true); // true porque será retentado
    }

    const updatedMessage = await messageRepository.findById(
      message.id.toString(),
    );
    expect(updatedMessage?.attempts).toBe(1);
    expect(updatedMessage?.status).not.toBe('failed');

    expect(enqueueSpy).toHaveBeenCalledWith(expect.any(MessageEntity));
    expect(processedSpy).toHaveBeenCalledWith(MessageType.HTTP, 'retry');
  });

  it('should mark message as failed when processing fails and no more retries are available', async () => {
    // Arrange
    const message = MessageEntity.create({
      type: MessageType.HTTP,
      destination: 'http://example.com',
      payload: { test: 'data' },
    });
    message.incrementAttempts();
    message.incrementAttempts();
    message.incrementAttempts();
    await messageRepository.save(message);

    const error = new Error('Processing failed');
    jest.spyOn(notifier, 'send').mockRejectedValueOnce(error);

    const failedSpy = jest.spyOn(metricsPort, 'recordMessageFailed');
    const processedSpy = jest.spyOn(metricsPort, 'recordMessageProcessed');

    // Act
    const result = await sut.execute({
      id: message.id.toString(),
    });

    // Assert
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.success).toBe(false);
    }

    const updatedMessage = await messageRepository.findById(
      message.id.toString(),
    );
    expect(updatedMessage?.status).toBe('failed');
    expect(updatedMessage?.reason).toBe('Processing failed');
    expect(updatedMessage?.attempts).toBe(4);

    expect(failedSpy).toHaveBeenCalledWith(MessageType.HTTP, 'Error');
    expect(processedSpy).toHaveBeenCalledWith(MessageType.HTTP, 'failed');
  });

  it('should handle dispatch failure during retry', async () => {
    // Arrange
    const message = MessageEntity.create({
      type: MessageType.HTTP,
      destination: 'http://example.com',
      payload: { test: 'data' },
    });
    await messageRepository.save(message);

    const processingError = new Error('Processing failed');
    const dispatchError = new Error('Dispatch failed');

    jest.spyOn(notifier, 'send').mockRejectedValueOnce(processingError);
    jest
      .spyOn(dispatcher, 'enqueueForProcessing')
      .mockRejectedValueOnce(dispatchError);

    // Act
    const result = await sut.execute({
      id: message.id.toString(),
    });

    // Assert
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.success).toBe(true);
    }

    const updatedMessage = await messageRepository.findById(
      message.id.toString(),
    );
    expect(updatedMessage?.status).toBe('failed');
    expect(updatedMessage?.reason).toBe(
      'Retry dispatch failed: Dispatch failed. Original error: Processing failed',
    );
  });

  it('should use backoff timeout when sending message', async () => {
    // Arrange
    const message = MessageEntity.create({
      type: MessageType.HTTP,
      destination: 'http://example.com',
      payload: { test: 'data' },
    });
    message.incrementAttempts(); // First retry should have 4s timeout
    await messageRepository.save(message);

    const sendSpy = jest.spyOn(notifier, 'send');

    // Act
    await sut.execute({
      id: message.id.toString(),
    });

    // Assert
    expect(sendSpy).toHaveBeenCalledWith(expect.any(MessageEntity), 4);
  });
});
