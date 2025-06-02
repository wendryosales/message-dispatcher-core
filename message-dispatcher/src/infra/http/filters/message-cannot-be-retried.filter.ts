// https://docs.nestjs.com/exception-filters#exception-filters-1
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { MessageCannotBeRetriedError } from 'src/domain/application/use-cases/retry-message.use-case';

@Catch(MessageCannotBeRetriedError)
export class MessageCannotBeRetriedFilter implements ExceptionFilter {
  catch(exception: MessageCannotBeRetriedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
    });
  }
}

export const MessageCannotBeRetriedFilterProvider = {
  provide: APP_FILTER,
  useClass: MessageCannotBeRetriedFilter,
};
