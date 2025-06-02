import { RetryMessageOutput } from 'src/domain/application/use-cases/retry-message.use-case';
import { RetryMessageResponseDto } from './dtos/retry-message-response.dto';

export class RetryMessagePresenter {
  static toHTTP(output: RetryMessageOutput): RetryMessageResponseDto {
    return {
      success: output.success,
      message: output.message,
    };
  }
}
