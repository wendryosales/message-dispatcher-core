import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseDescription } from 'src/core/types/response-description';
import { GetMessageByIdUseCase } from 'src/domain/application/use-cases/get-message-by-id.use-case';
import { GetMessageByIdResponseDto } from './dtos/get-message-by-id-response.dto';
import { GetMessageByIdPresenter } from './get-message-by-id.presenter';

@ApiTags('messages')
@Controller('messages/:id')
export class GetMessageByIdController {
  constructor(private readonly getMessageByIdUseCase: GetMessageByIdUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get a message by ID' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the message' })
  @ApiResponse({
    status: 200,
    type: GetMessageByIdResponseDto,
    description: ResponseDescription.OK,
  })
  @ApiResponse({
    status: 404,
    description: ResponseDescription.NOT_FOUND,
  })
  @ApiResponse({
    status: 500,
    description: ResponseDescription.INTERNAL_SERVER_ERROR,
  })
  async getById(@Param('id') id: string) {
    const result = await this.getMessageByIdUseCase.execute({ id });

    if (result.isLeft()) {
      throw result.value;
    }

    return GetMessageByIdPresenter.toHTTP(result.value);
  }
}
