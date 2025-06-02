import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageRepository } from 'src/domain/application/ports/message.repository';
import { MessageEntity } from 'src/domain/enterprise/entities/message.entity';
import { MessageMapper } from '../mappers/message.mapper';
import { Message, MessageDocument } from '../schemas/message.schema';

@Injectable()
export class MongooseMessageRepository implements MessageRepository {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async save(message: MessageEntity): Promise<void> {
    const data = MessageMapper.toPersistence(message);

    await this.messageModel.findByIdAndUpdate(data._id, data, {
      upsert: true,
      new: true,
    });
  }

  async findById(id: string): Promise<MessageEntity | null> {
    const message = await this.messageModel.findById(id).lean();

    if (!message) {
      return null;
    }

    return MessageMapper.toDomain(message as Message);
  }
}

export const MongooseMessageRepositoryProvider = {
  provide: MessageRepository,
  useClass: MongooseMessageRepository,
};
