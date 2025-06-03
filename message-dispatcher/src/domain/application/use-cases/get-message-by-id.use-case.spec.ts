import { ResourceNotFoundError } from 'src/core/errors/resource-not-found.error';
import {
  MessageEntity,
  MessageType,
} from 'src/domain/enterprise/entities/message.entity';
import { InMemoryMessageRepository } from 'test/repositories/in-memory-message.repository';
import { GetMessageByIdUseCase } from './get-message-by-id.use-case';

describe('GetMessageByIdUseCase', () => {
  let sut: GetMessageByIdUseCase;
  let messageRepository: InMemoryMessageRepository;

  beforeEach(() => {
    messageRepository = new InMemoryMessageRepository();
    sut = new GetMessageByIdUseCase(messageRepository);
  });

  it('should get a message by id', async () => {
    // Arrange
    const createdMessage = MessageEntity.create({
      type: MessageType.HTTP,
      destination: 'http://example.com',
      payload: { test: 'data' },
    });

    await messageRepository.save(createdMessage);

    // Act
    const result = await sut.execute({
      id: createdMessage.id.toString(),
    });

    // Assert
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.message).toEqual({
        id: createdMessage.id.toString(),
        type: MessageType.HTTP,
        destination: 'http://example.com',
        payload: { test: 'data' },
        status: 'pending',
        attempts: 0,
        reason: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    }
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
});
