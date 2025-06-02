import {
  MessageEntity,
  MessageStatus,
  MessageType,
} from 'src/domain/enterprise/entities/message.entity';

export interface KafkaMessagePayload {
  id: string;
  type: string;
  destination: string;
  payload: any;
  status: string;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface KafkaMessageHeaders {
  messageType: string;
  destination: string;
  createdAt: string;
  [key: string]: string;
}

export class KafkaMessageMapper {
  static toKafkaMessage(message: MessageEntity) {
    return {
      key: message.id.toString(),
      value: JSON.stringify({
        id: message.id.toString(),
        type: message.type,
        destination: message.destination,
        payload: message.payload,
        status: message.status,
        attempts: message.attempts,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
      } as KafkaMessagePayload),
      headers: {
        messageType: message.type,
        destination: message.destination,
        createdAt: message.createdAt.toISOString(),
      } as KafkaMessageHeaders,
    };
  }

  static fromKafkaMessage(value: string): KafkaMessagePayload {
    try {
      const parsed = JSON.parse(value);
      return {
        id: parsed.id,
        type: parsed.type,
        destination: parsed.destination,
        payload: parsed.payload,
        status: parsed.status,
        attempts: parsed.attempts,
        createdAt: parsed.createdAt,
        updatedAt: parsed.updatedAt,
      };
    } catch (error) {
      throw new Error(`Failed to parse Kafka message: ${error.message}`);
    }
  }

  static toMessageEntity(kafkaPayload: KafkaMessagePayload): MessageEntity {
    return MessageEntity.fromPersistence({
      id: kafkaPayload.id,
      type: kafkaPayload.type as MessageType,
      destination: kafkaPayload.destination,
      payload: kafkaPayload.payload,
      status: kafkaPayload.status as MessageStatus,
      attempts: kafkaPayload.attempts,
      createdAt: new Date(kafkaPayload.createdAt),
      updatedAt: new Date(kafkaPayload.updatedAt),
    });
  }
}
