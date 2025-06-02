import { Injectable } from '@nestjs/common';
import { NotifierPort } from 'src/domain/application/ports/notifier.port';
import { MessageType } from 'src/domain/enterprise/entities/message.entity';
import { EmailNotifierService } from './email-notifier.service';
import { HttpNotifierService } from './http-notifier.service';

@Injectable()
export class NotifierFactory {
  constructor(
    private readonly httpNotifier: HttpNotifierService,
    private readonly emailNotifier: EmailNotifierService,
  ) {}

  getNotifier(type: MessageType): NotifierPort {
    switch (type) {
      case MessageType.HTTP:
        return this.httpNotifier;
      case MessageType.EMAIL:
        return this.emailNotifier;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  }
}
