import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageRepository } from 'src/domain/application/ports/message.repository';
import { MessageMapper } from './mongoose/mappers/message.mapper';
import { MongooseMessageRepositoryProvider } from './mongoose/repositories/mongoose-message.repository';
import { Message, MessageSchema } from './mongoose/schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
    }),
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
  ],
  providers: [MessageMapper, MongooseMessageRepositoryProvider],
  exports: [MessageRepository],
})
export class DatabaseModule {}
