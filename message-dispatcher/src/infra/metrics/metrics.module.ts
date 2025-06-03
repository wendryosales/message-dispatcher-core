import { Module } from '@nestjs/common';
import { MetricsPort } from 'src/domain/application/ports/metrics.port';
import {
  MetricsPortProvider,
  PrometheusMetricsAdapter,
} from './adapters/prometheus-metrics.adapter';
import { MetricsController } from './controllers/metrics.controller';
import { MetricsService } from './services/metrics.service';

@Module({
  providers: [MetricsService, PrometheusMetricsAdapter, MetricsPortProvider],
  controllers: [MetricsController],
  exports: [MetricsPort, MetricsService],
})
export class MetricsModule {}
