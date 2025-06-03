import { Injectable } from '@nestjs/common';
import { NotifierPort } from 'src/domain/application/ports/notifier.port';
import { MessageEntity } from 'src/domain/enterprise/entities/message.entity';
import { NotifierFactory } from './notifier.factory';

@Injectable()
export class NotifierService extends NotifierPort {
  constructor(private readonly notifierFactory: NotifierFactory) {
    super();
  }

  async send(message: MessageEntity, timeoutInSeconds: number): Promise<void> {
    const notifier = this.notifierFactory.getNotifier(message.type);
    await notifier.send(message, timeoutInSeconds);
  }
}

export const NotifierServiceProvider = {
  provide: NotifierPort,
  useClass: NotifierService,
};
