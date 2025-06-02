import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'src/core/either-pattern/either';
import { ResourceNotFoundError } from 'src/core/errors/resource-not-found.error';
import { MessageRepository } from '../ports/message.repository';

export interface GetMessageByIdInput {
  id: string;
}

export interface GetMessageByIdOutput {
  message: {
    id: string;
    type: string;
    destination: string;
    payload: any;
    status: string;
    attempts: number;
    reason?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export type GetMessageByIdResult = Either<
  ResourceNotFoundError,
  GetMessageByIdOutput
>;

@Injectable()
export class GetMessageByIdUseCase {
  constructor(private readonly repository: MessageRepository) {}

  async execute(input: GetMessageByIdInput): Promise<GetMessageByIdResult> {
    const message = await this.repository.findById(input.id);

    if (!message) {
      return left(
        new ResourceNotFoundError(`Message with id ${input.id} not found`),
      );
    }

    return right({
      message: {
        id: message.id.toString(),
        type: message.type,
        destination: message.destination,
        payload: message.payload,
        status: message.status,
        attempts: message.attempts,
        reason: message.reason,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      },
    });
  }
}
