import { MessageEntity } from 'src/domain/enterprise/entities/message.entity';

export abstract class MessageRepository {
  abstract save(message: MessageEntity): Promise<void>;
  abstract findById(id: string): Promise<MessageEntity | null>;
}
