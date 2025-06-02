import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { DispatcherService } from 'src/domain/application/ports/dispatcher.service';
import {
  MessageEntity,
  MessageType,
} from 'src/domain/enterprise/entities/message.entity';
import { KafkaMessageMapper } from '../mappers/kafka-message.mapper';

export enum KafkaTopics {
  HTTP_MESSAGES = 'message-dispatcher.http-messages',
  EMAIL_MESSAGES = 'message-dispatcher.email-messages',
  UNKNOWN_MESSAGES = 'message-dispatcher.unknown-messages',
}

@Injectable()
export class KafkaDispatcherService
  implements DispatcherService, OnModuleInit, OnModuleDestroy
{
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const brokers = this.configService.get<string>('KAFKA_BROKERS');

    this.kafka = new Kafka({
      clientId: 'message-dispatcher-producer',
      brokers: brokers.split(','),
    });

    this.producer = this.kafka.producer();
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async enqueueForProcessing(message: MessageEntity): Promise<void> {
    const topic = this.getTopicByMessageType(message.type);
    const kafkaMessage = KafkaMessageMapper.toKafkaMessage(message);

    await this.producer.send({
      topic,
      messages: [kafkaMessage],
    });
  }

  private getTopicByMessageType(type: string): string {
    const topicMap = new Map<string, string>([
      [MessageType.HTTP, KafkaTopics.HTTP_MESSAGES],
      [MessageType.EMAIL, KafkaTopics.EMAIL_MESSAGES],
    ]);

    return topicMap.get(type) || KafkaTopics.UNKNOWN_MESSAGES;
  }
}

export const KafkaDispatcherServiceProvider = {
  provide: DispatcherService,
  useClass: KafkaDispatcherService,
};
