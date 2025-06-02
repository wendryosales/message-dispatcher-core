import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ResponseDescription } from 'src/core/types/response-description';
import { CreateMessageUseCase } from 'src/domain/application/use-cases/create-message.use-case';
import { CreateMessagePresenter } from './create-message.presenter';
import { CreateMessageRequestDto } from './dtos/create-message-request.dto';
import { CreateMessageResponseDto } from './dtos/create-message-response.dto';

@ApiTags('create message')
@Controller('/messages')
export class CreateMessageController {
  constructor(private createMessageUseCase: CreateMessageUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: CreateMessageResponseDto,
    description: ResponseDescription.OK,
  })
  @ApiBadRequestResponse({ description: ResponseDescription.BAD_REQUEST })
  @ApiInternalServerErrorResponse({
    description: ResponseDescription.INTERNAL_SERVER_ERROR,
  })
  async handler(@Body() body: CreateMessageRequestDto) {
    const response = await this.createMessageUseCase.execute({
      type: body.type,
      destination: body.destination,
      payload: body.payload,
    });

    if (response.isLeft()) {
      throw response.value;
    }

    return CreateMessagePresenter.toHTTP(response.value);
  }
}
