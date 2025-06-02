import { CreateMessageSuccessOutput } from 'src/domain/application/use-cases/create-message.use-case';
import { CreateMessageResponseDto } from './dtos/create-message-response.dto';

export class CreateMessagePresenter {
  static toHTTP(
    response: CreateMessageSuccessOutput,
  ): CreateMessageResponseDto {
    return {
      id: response.id,
    };
  }
}
