import { Injectable } from '@nestjs/common';
import { MessageEntity } from 'src/domain/enterprise/entities/message.entity';
import { Message } from '../schemas/message.schema';

@Injectable()
export class MessageMapper {
  static toDomain(raw: Message): MessageEntity {
    return MessageEntity.fromPersistence({
      id: raw._id,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      type: raw.type,
      destination: raw.destination,
      payload: raw.payload,
      status: raw.status,
      attempts: raw.attempts,
      reason: raw.reason,
    });
  }

  static toPersistence(message: MessageEntity): Message {
    return {
      _id: message.id.toString(),
      type: message.type,
      destination: message.destination,
      payload: message.payload,
      status: message.status,
      attempts: message.attempts,
      reason: message.reason,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    } as Message;
  }
}
