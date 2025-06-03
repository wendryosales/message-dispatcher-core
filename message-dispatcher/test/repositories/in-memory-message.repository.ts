import { MessageRepository } from '../../src/domain/application/ports/message.repository';
import { MessageEntity } from '../../src/domain/enterprise/entities/message.entity';

export class InMemoryMessageRepository implements MessageRepository {
  private messages: Map<string, MessageEntity> = new Map();

  async save(message: MessageEntity): Promise<void> {
    this.messages.set(message.id.toString(), message);
  }

  async findById(id: string): Promise<MessageEntity | null> {
    const message = this.messages.get(id);
    return message ?? null;
  }
}
