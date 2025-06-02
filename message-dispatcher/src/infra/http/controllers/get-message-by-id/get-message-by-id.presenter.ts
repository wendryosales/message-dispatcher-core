import { GetMessageByIdOutput } from 'src/domain/application/use-cases/get-message-by-id.use-case';
import { GetMessageByIdResponseDto } from './dtos/get-message-by-id-response.dto';

export class GetMessageByIdPresenter {
  static toHTTP(response: GetMessageByIdOutput): GetMessageByIdResponseDto {
    return {
      id: response.message.id,
      type: response.message.type,
      destination: response.message.destination,
      payload: response.message.payload,
      status: response.message.status,
      attempts: response.message.attempts,
      reason: response.message.reason,
      createdAt: response.message.createdAt,
      updatedAt: response.message.updatedAt,
    };
  }
}
