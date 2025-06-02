import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RetryMessageUseCase } from 'src/domain/application/use-cases/retry-message.use-case';
import { RetryMessageResponseDto } from './dtos/retry-message-response.dto';
import { RetryMessagePresenter } from './retry-message.presenter';

@ApiTags('messages')
@Controller('messages/:id/retry')
export class RetryMessageController {
  constructor(private readonly retryMessageUseCase: RetryMessageUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry failed message' })
  @ApiParam({ name: 'id', description: 'Message ID to retry' })
  @ApiResponse({
    status: 200,
    description: 'Message queued for retry',
    type: RetryMessageResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @ApiBadRequestResponse({ description: 'Message cannot be retried' })
  async retry(@Param('id') id: string) {
    const result = await this.retryMessageUseCase.execute({ id });

    if (result.isLeft()) {
      throw result.value;
    }

    return RetryMessagePresenter.toHTTP(result.value);
  }
}
