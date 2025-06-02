import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  MessageStatus,
  MessageType,
} from 'src/domain/enterprise/entities/message.entity';

@Schema({ collection: 'messages', timestamps: true })
export class Message {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, enum: MessageType })
  type: MessageType;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true, type: Object })
  payload: Record<string, any>;

  @Prop({ required: true, enum: MessageStatus, default: MessageStatus.PENDING })
  status: MessageStatus;

  @Prop({ required: true, default: 0 })
  attempts: number;

  @Prop({ required: false })
  reason: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export type MessageDocument = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);
