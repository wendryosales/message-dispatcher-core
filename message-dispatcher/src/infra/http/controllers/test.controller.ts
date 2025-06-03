import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Test')
@Controller('test')
export class TestController {
  @Post('webhook')
  @ApiOperation({
    summary: 'Test webhook endpoint with configurable failure rate',
    description: 'Simulates HTTP failures based on failure percentage',
  })
  @ApiQuery({
    name: 'failureRate',
    required: false,
    type: Number,
    description: 'Failure rate percentage (0-100). Default: 30',
  })
  @ApiBody({
    description: 'Any JSON payload',
    schema: { type: 'object' },
  })
  async testWebhook(
    @Body() payload: any,
    @Query('failureRate') failureRateParam?: string,
  ): Promise<any> {
    const failureRate = parseInt(failureRateParam) || 30; // Default 30% failure
    const shouldFail = Math.random() * 100 < failureRate;

    if (shouldFail) {
      const errorType = Math.floor(Math.random() * 4);

      switch (errorType) {
        case 0:
          // Simulate timeout (delay then return)
          await new Promise((resolve) => setTimeout(resolve, 12000)); // > 10s timeout
          break;

        case 1:
          // 400 Bad Request
          throw new HttpException(
            'Bad Request: Invalid payload format',
            HttpStatus.BAD_REQUEST,
          );

        case 2:
          // 500 Internal Server Error
          throw new HttpException(
            'Internal Server Error: Database connection failed',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );

        case 3:
          // 503 Service Unavailable
          throw new HttpException(
            'Service Unavailable: Maintenance mode',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
      }
    }

    return {
      success: true,
      message: 'Webhook received successfully',
      timestamp: new Date().toISOString(),
      receivedPayload: payload,
      failureRate: failureRate,
    };
  }
}
