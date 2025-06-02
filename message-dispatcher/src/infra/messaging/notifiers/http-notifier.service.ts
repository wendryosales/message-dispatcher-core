import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { NotifierPort } from 'src/domain/application/ports/notifier.port';
import { MessageEntity } from 'src/domain/enterprise/entities/message.entity';

@Injectable()
export class HttpNotifierService extends NotifierPort {
  private readonly DEFAULT_TIMEOUT = 10000; // 10 segundos

  constructor(private readonly httpService: HttpService) {
    super();
  }

  async send(message: MessageEntity): Promise<void> {
    try {
      const response$ = this.httpService
        .post(message.destination, message.payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: this.DEFAULT_TIMEOUT,
        })
        .pipe(
          timeout(this.DEFAULT_TIMEOUT),
          catchError((error: AxiosError) => {
            throw this.handleHttpError(error, message.destination);
          }),
        );

      await firstValueFrom(response$);
    } catch (error) {
      console.error('❌ HTTP notification failed:', {
        destination: message.destination,
        error: error.message,
      });

      throw error;
    }
  }

  private handleHttpError(error: AxiosError, destination: string): Error {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new Error(
        `Request timeout after ${this.DEFAULT_TIMEOUT}ms to ${destination}`,
      );
    }

    if (error.response) {
      const { status, statusText, data } = error.response;
      return new Error(
        `HTTP ${status}: ${statusText}. Response: ${JSON.stringify(data)}`,
      );
    }

    if (error.request) {
      return new Error(
        `No response received from ${destination}. Network error: ${error.message}`,
      );
    }

    return new Error(
      `Failed to send HTTP notification to ${destination}: ${error.message}`,
    );
  }
}
