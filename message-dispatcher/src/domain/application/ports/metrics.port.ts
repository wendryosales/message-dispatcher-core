export abstract class MetricsPort {
  abstract recordMessageCreated(type: string): void;
  abstract recordMessageProcessed(
    type: string,
    status: 'success' | 'failed' | 'retry',
  ): void;
  abstract recordMessageFailed(type: string, reason: string): void;
  abstract recordMessageRetried(type: string): void;
  abstract recordMessageProcessingDuration(
    type: string,
    durationSeconds: number,
  ): void;
  abstract recordMessageProduced(topic: string): void;
  abstract recordMessageConsumed(topic: string, consumerGroup: string): void;
  abstract recordNotificationSent(
    type: string,
    status: 'success' | 'failed',
  ): void;
  abstract recordNotificationDuration(
    type: string,
    durationSeconds: number,
  ): void;
}
