import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { DispatcherService } from 'src/domain/application/ports/dispatcher.service';
import { MetricsPort } from 'src/domain/application/ports/metrics.port';
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
  private readonly kafka: Kafka;
  private producer: Producer;

  constructor(
    private readonly configService: ConfigService,
    private readonly metricsPort: MetricsPort,
  ) {
    this.kafka = new Kafka({
      clientId: 'message-dispatcher',
      brokers: [this.configService.get<string>('KAFKA_BROKERS')],
    });
  }

  async onModuleInit() {
    await this.createProducer();

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

    this.metricsPort.recordMessageProduced(topic);
  }

  private async createProducer() {
    this.producer = this.kafka.producer();
  }

  private getTopicByMessageType(type: MessageType): string {
    switch (type) {
      case MessageType.HTTP:
        return KafkaTopics.HTTP_MESSAGES;
      case MessageType.EMAIL:
        return KafkaTopics.EMAIL_MESSAGES;
      default:
        return KafkaTopics.UNKNOWN_MESSAGES;
    }
  }
}

export const KafkaDispatcherServiceProvider = {
  provide: DispatcherService,
  useClass: KafkaDispatcherService,
};
