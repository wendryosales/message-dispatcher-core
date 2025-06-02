import { MessageEntity } from 'src/domain/enterprise/entities/message.entity';

export abstract class DispatcherService {
  abstract enqueueForProcessing(message: MessageEntity): Promise<void>;
}
