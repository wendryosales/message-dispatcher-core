import { MessageEntity } from 'src/domain/enterprise/entities/message.entity';

export abstract class NotifierPort {
  abstract send(
    message: MessageEntity,
    timeoutInSeconds: number,
  ): Promise<void>;
}
