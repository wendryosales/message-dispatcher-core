import { DispatcherService } from "src/domain/application/ports/dispatcher.service";
import { MessageEntity } from "src/domain/enterprise/entities/message.entity";

export class MockDispatcherService implements DispatcherService {
  async enqueueForProcessing(message: MessageEntity): Promise<void> {
    // Mock implementation
  }
}
