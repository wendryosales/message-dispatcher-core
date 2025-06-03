import { Injectable } from '@nestjs/common';
import { MetricsPort } from 'src/domain/application/ports/metrics.port';
import { NotifierPort } from 'src/domain/application/ports/notifier.port';
import { MessageEntity } from 'src/domain/enterprise/entities/message.entity';

@Injectable()
export class EmailNotifierService extends NotifierPort {
  constructor(private readonly metricsPort: MetricsPort) {
    super();
  }

  async send(message: MessageEntity): Promise<void> {
    const startTime = Date.now();

    try {
      console.log('📧 Sending Email notification:', {
        destination: message.destination,
        payload: message.payload,
      });

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const duration = (Date.now() - startTime) / 1000;
      this.metricsPort.recordNotificationDuration('email', duration);
      this.metricsPort.recordNotificationSent('email', 'success');
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      this.metricsPort.recordNotificationDuration('email', duration);
      this.metricsPort.recordNotificationSent('email', 'failed');

      throw error;
    }
  }
}
