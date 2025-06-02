import { ApiProperty } from '@nestjs/swagger';

export class RetryMessageResponseDto {
  @ApiProperty({
    description: 'Indicates if the retry was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Descriptive message about the retry operation',
    example: 'Message queued for retry',
  })
  message: string;
}
