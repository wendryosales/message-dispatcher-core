import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsString } from 'class-validator';

enum MessageType {
  HTTP = 'http',
  EMAIL = 'email',
}

export class CreateMessageRequestDto {
  @ApiProperty({
    description: 'The message type',
    example: 'http',
  })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiProperty({
    description: 'The message destination',
    example: 'https://meusistema.com/webhook',
  })
  @IsString()
  destination: string;

  @ApiProperty({
    description: 'The message payload',
    example: {
      event: 'order.created',
      data: { qualquer: 'coisa' },
    },
  })
  @IsObject()
  payload: Record<string, any>;
}
