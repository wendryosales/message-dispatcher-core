import { Injectable } from '@nestjs/common';
import { MetricsPort } from 'src/domain/application/ports/metrics.port';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class PrometheusMetricsAdapter extends MetricsPort {
  constructor(private readonly metricsService: MetricsService) {
    super();
  }

  recordMessageCreated(type: string): void {
    this.metricsService.messagesCreatedTotal.labels(type).inc();
  }

  recordMessageProcessed(
    type: string,
    status: 'success' | 'failed' | 'retry',
  ): void {
    this.metricsService.messagesProcessedTotal.labels(type, status).inc();
  }

  recordMessageFailed(type: string, reason: string): void {
    this.metricsService.messagesFailedTotal.labels(type, reason).inc();
  }

  recordMessageRetried(type: string): void {
    this.metricsService.messagesRetriedTotal.labels(type).inc();
  }

  recordMessageProcessingDuration(type: string, durationSeconds: number): void {
    this.metricsService.messageProcessingDuration
      .labels(type)
      .observe(durationSeconds);
  }

  recordMessageProduced(topic: string): void {
    this.metricsService.kafkaMessagesProduced.labels(topic).inc();
  }

  recordMessageConsumed(topic: string, consumerGroup: string): void {
    this.metricsService.kafkaMessagesConsumed
      .labels(topic, consumerGroup)
      .inc();
  }

  recordNotificationSent(type: string, status: 'success' | 'failed'): void {
    if (status === 'success') {
      this.metricsService.notificationsSentTotal.labels(type, 'success').inc();
    } else {
      this.metricsService.notificationsFailedTotal
        .labels(type, 'unknown')
        .inc();
    }
  }

  recordNotificationDuration(type: string, durationSeconds: number): void {
    this.metricsService.notificationDuration
      .labels(type)
      .observe(durationSeconds);
  }
}

export const MetricsPortProvider = {
  provide: MetricsPort,
  useClass: PrometheusMetricsAdapter,
};
