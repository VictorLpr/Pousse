import type { Clock } from '@/shared/infrastructure/time/clock';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
