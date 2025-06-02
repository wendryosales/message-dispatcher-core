import { Injectable } from '@nestjs/common';
import { NotifierPort } from 'src/domain/application/ports/notifier.port';
import { MessageEntity } from 'src/domain/enterprise/entities/message.entity';

@Injectable()
export class EmailNotifierService extends NotifierPort {
  async send(message: MessageEntity): Promise<void> {
    console.log('📧 Sending Email notification:', {
      destination: message.destination,
      payload: message.payload,
    });

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
