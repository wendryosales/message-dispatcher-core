import {
  MessageEntity,
  MessageType,
} from 'src/domain/enterprise/entities/message.entity';
import { MockMetricsPort } from 'test/adapters/mock-metrics.port';

import { InMemoryMessageRepository } from 'test/repositories/in-memory-message.repository';
import { MockDispatcherService } from 'test/services/mock-dispatcher.service';
import { CreateMessageUseCase } from './create-message.use-case';

describe('CreateMessageUseCase', () => {
  let sut: CreateMessageUseCase;
  let messageRepository: InMemoryMessageRepository;
  let dispatcherService: MockDispatcherService;
  let metricsPort: MockMetricsPort;

  beforeEach(() => {
    messageRepository = new InMemoryMessageRepository();
    dispatcherService = new MockDispatcherService();
    metricsPort = new MockMetricsPort();
    sut = new CreateMessageUseCase(
      messageRepository,
      dispatcherService,
      metricsPort,
    );
  });

  it('should create a new message', async () => {
    const result = await sut.execute({
      type: MessageType.HTTP,
      destination: 'http://example.com',
      payload: { test: 'data' },
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.id).toBeDefined();
    }

    const message = await messageRepository.findById(result.value.id);
    expect(message).toBeDefined();
    expect(message?.type).toBe(MessageType.HTTP);
    expect(message?.destination).toBe('http://example.com');
    expect(message?.payload).toEqual({ test: 'data' });
  });

  it('should enqueue message for processing after creation', async () => {
    const enqueueSpy = jest.spyOn(dispatcherService, 'enqueueForProcessing');

    await sut.execute({
      type: MessageType.HTTP,
      destination: 'http://example.com',
      payload: { test: 'data' },
    });

    expect(enqueueSpy).toHaveBeenCalled();
    expect(enqueueSpy).toHaveBeenCalledWith(expect.any(MessageEntity));
  });

  it('should record metrics after message creation', async () => {
    const recordMetricsSpy = jest.spyOn(metricsPort, 'recordMessageCreated');

    await sut.execute({
      type: MessageType.HTTP,
      destination: 'http://example.com',
      payload: { test: 'data' },
    });

    expect(recordMetricsSpy).toHaveBeenCalledWith(MessageType.HTTP);
  });
});
