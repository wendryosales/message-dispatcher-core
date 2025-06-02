import { CommonProps, makeCommonProps } from 'src/core/entities/common-props';
import { Entity } from 'src/core/entities/entity';

export enum MessageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum MessageType {
  HTTP = 'http',
  EMAIL = 'email',
}

export type MessageEntityProps = {
  type: MessageType;
  destination: string;
  payload: any;
  status: MessageStatus;
  attempts: number;
  reason?: string;
};

export type MessageEntityCreateProps = Omit<
  MessageEntityProps,
  'status' | 'attempts' | 'reason'
>;

export type MessageEntityPersistenceProps = MessageEntityProps & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export class MessageEntity extends Entity<MessageEntityProps> {
  static create(
    props: MessageEntityCreateProps,
    commonProps?: CommonProps,
  ): MessageEntity {
    return new MessageEntity(
      {
        ...props,
        status: MessageStatus.PENDING,
        attempts: 0,
      },
      commonProps,
    );
  }

  static fromPersistence(props: MessageEntityPersistenceProps): MessageEntity {
    return new MessageEntity(props, makeCommonProps(props));
  }

  get type(): MessageType {
    return this.props.type;
  }

  get destination(): string {
    return this.props.destination;
  }

  get payload(): any {
    return this.props.payload;
  }

  get status(): MessageStatus {
    return this.props.status;
  }

  get attempts(): number {
    return this.props.attempts;
  }

  get reason(): string | undefined {
    return this.props.reason;
  }

  markProcessing() {
    this.props.status = MessageStatus.PROCESSING;
    this.hasChanged();
  }

  markSuccess() {
    this.props.status = MessageStatus.SUCCESS;
    this.hasChanged();
  }

  markFailed(reason?: string) {
    this.props.status = MessageStatus.FAILED;
    this.props.reason = reason;
    this.hasChanged();
  }

  incrementAttempts() {
    this.props.attempts += 1;
    this.hasChanged();
  }

  canRetry(): boolean {
    return (
      this.attempts < 3 &&
      this.status !== MessageStatus.SUCCESS &&
      this.status !== MessageStatus.FAILED
    );
  }
}
