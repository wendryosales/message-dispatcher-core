import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka } from 'kafkajs';
import { ProcessMessageUseCase } from 'src/domain/application/use-cases/process-message.use-case';
import { KafkaMessageMapper } from '../mappers/kafka-message.mapper';
import { KafkaTopics } from '../services/kafka-dispatcher.service';

@Injectable()
export class MessageProcessorConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly processMessageUseCase: ProcessMessageUseCase,
  ) {
    this.kafka = new Kafka({
      clientId: 'message-processor',
      brokers: [this.configService.get<string>('KAFKA_BROKERS')],
    });
  }

  async onModuleInit() {
    await this.createConsumer();
    await this.subscribe();
    await this.run();
  }

  private async createConsumer() {
    this.consumer = this.kafka.consumer({
      groupId: 'message-processor-group',
    });
  }

  private async subscribe() {
    await this.consumer.subscribe({
      topics: Object.values(KafkaTopics),
      fromBeginning: false,
    });
  }

  private async run() {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const kafkaPayload = KafkaMessageMapper.fromKafkaMessage(
            message.value.toString(),
          );

          await this.processMessageUseCase.execute({ id: kafkaPayload.id });
        } catch (error) {
          console.error('❌ Error processing message:', error);
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
