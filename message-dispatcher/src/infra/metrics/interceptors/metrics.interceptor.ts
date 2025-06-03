import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();
    const method = request.method;
    const route = request.route?.path || request.url;

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordMetrics(method, route, response.statusCode, startTime);
        },
        error: () => {
          this.recordMetrics(
            method,
            route,
            response.statusCode || 500,
            startTime,
          );
        },
      }),
    );
  }

  private recordMetrics(
    method: string,
    route: string,
    statusCode: number,
    startTime: number,
  ) {
    const duration = (Date.now() - startTime) / 1000;

    this.metricsService.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);

    this.metricsService.httpRequestTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }
}
