import { NotifierPort } from 'src/domain/application/ports/notifier.port';
import { MessageEntity } from 'src/domain/enterprise/entities/message.entity';

export class MockNotifierAdapter implements NotifierPort {
  async send(message: MessageEntity, timeoutInSeconds: number): Promise<void> {
    // Mock implementation
  }
}
