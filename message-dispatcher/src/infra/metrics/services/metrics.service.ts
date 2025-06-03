import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly register: client.Registry;
  public readonly httpRequestDuration: client.Histogram<string>;
  public readonly httpRequestTotal: client.Counter<string>;
  public readonly messagesCreatedTotal: client.Counter<string>;
  public readonly messagesProcessedTotal: client.Counter<string>;
  public readonly messagesFailedTotal: client.Counter<string>;
  public readonly messagesRetriedTotal: client.Counter<string>;
  public readonly messageProcessingDuration: client.Histogram<string>;
  public readonly kafkaMessagesProduced: client.Counter<string>;
  public readonly kafkaMessagesConsumed: client.Counter<string>;
  public readonly notificationsSentTotal: client.Counter<string>;
  public readonly notificationsFailedTotal: client.Counter<string>;
  public readonly notificationDuration: client.Histogram<string>;

  constructor(private readonly configService: ConfigService) {
    this.register = new client.Registry();

    // HTTP Metrics
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    this.httpRequestTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    // Message Processing Metrics
    this.messagesCreatedTotal = new client.Counter({
      name: 'messages_created_total',
      help: 'Total number of messages created',
      labelNames: ['type'],
    });

    this.messagesProcessedTotal = new client.Counter({
      name: 'messages_processed_total',
      help: 'Total number of messages processed',
      labelNames: ['type', 'status'],
    });

    this.messagesFailedTotal = new client.Counter({
      name: 'messages_failed_total',
      help: 'Total number of failed messages',
      labelNames: ['type', 'reason'],
    });

    this.messagesRetriedTotal = new client.Counter({
      name: 'messages_retried_total',
      help: 'Total number of retried messages',
      labelNames: ['type'],
    });

    this.messageProcessingDuration = new client.Histogram({
      name: 'message_processing_duration_seconds',
      help: 'Duration of message processing in seconds',
      labelNames: ['type'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
    });

    // Kafka Metrics
    this.kafkaMessagesProduced = new client.Counter({
      name: 'kafka_messages_produced_total',
      help: 'Total number of messages produced to Kafka',
      labelNames: ['topic'],
    });

    this.kafkaMessagesConsumed = new client.Counter({
      name: 'kafka_messages_consumed_total',
      help: 'Total number of messages consumed from Kafka',
      labelNames: ['topic', 'group'],
    });

    // Notification Metrics
    this.notificationsSentTotal = new client.Counter({
      name: 'notifications_sent_total',
      help: 'Total number of notifications sent',
      labelNames: ['type', 'status'],
    });

    this.notificationsFailedTotal = new client.Counter({
      name: 'notifications_failed_total',
      help: 'Total number of failed notifications',
      labelNames: ['type', 'reason'],
    });

    this.notificationDuration = new client.Histogram({
      name: 'notification_duration_seconds',
      help: 'Duration of notification sending in seconds',
      labelNames: ['type'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
    });
  }

  onModuleInit() {
    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.httpRequestTotal);
    this.register.registerMetric(this.messagesCreatedTotal);
    this.register.registerMetric(this.messagesProcessedTotal);
    this.register.registerMetric(this.messagesFailedTotal);
    this.register.registerMetric(this.messagesRetriedTotal);
    this.register.registerMetric(this.messageProcessingDuration);
    this.register.registerMetric(this.kafkaMessagesProduced);
    this.register.registerMetric(this.kafkaMessagesConsumed);
    this.register.registerMetric(this.notificationsSentTotal);
    this.register.registerMetric(this.notificationsFailedTotal);
    this.register.registerMetric(this.notificationDuration);

    client.collectDefaultMetrics({ register: this.register });
  }

  getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  getRegistry(): client.Registry {
    return this.register;
  }
}
