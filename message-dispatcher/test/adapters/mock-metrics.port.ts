import { MetricsPort } from "src/domain/application/ports/metrics.port";

export class MockMetricsPort implements MetricsPort {
  recordMessageCreated(type: string): void {}
  recordMessageProcessed(
    type: string,
    status: "success" | "failed" | "retry"
  ): void {}
  recordMessageFailed(type: string, reason: string): void {}
  recordMessageRetried(type: string): void {}
  recordMessageProcessingDuration(
    type: string,
    durationSeconds: number
  ): void {}
  recordMessageProduced(topic: string): void {}
  recordMessageConsumed(topic: string, consumerGroup: string): void {}
  recordNotificationSent(type: string, status: "success" | "failed"): void {}
  recordNotificationDuration(type: string, durationSeconds: number): void {}
}
