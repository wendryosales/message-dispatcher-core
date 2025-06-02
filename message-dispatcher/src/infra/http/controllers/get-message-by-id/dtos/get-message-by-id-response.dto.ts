import { ApiProperty } from '@nestjs/swagger';

export class GetMessageByIdResponseDto {
  @ApiProperty({
    description: 'The message id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The message type',
    example: 'email',
  })
  type: string;

  @ApiProperty({
    description: 'The message destination',
    example: 'john.doe@example.com',
  })
  destination: string;

  @ApiProperty({
    description: 'The message payload',
    example: {
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
  })
  payload: Record<string, any>;

  @ApiProperty({
    description: 'The message status',
    example: 'pending',
  })
  status: string;

  @ApiProperty({
    description: 'The number of attempts made to send the message',
    example: 1,
  })
  attempts: number;

  @ApiProperty({
    description: 'The reason for the message failure',
    example: 'The message was not sent because the server is down',
  })
  reason?: string;

  @ApiProperty({
    description: 'The date and time the message was created',
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time the message was updated',
    example: '2021-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
