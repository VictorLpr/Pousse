import type { Clock } from '@/shared/domain/ports/clock';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
