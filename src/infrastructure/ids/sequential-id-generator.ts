import type { IdGenerator } from '@/domain/ports/id-generator';

export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;

  constructor(private readonly prefix = 'id') {}

  next(): string {
    this.counter += 1;
    return `${this.prefix}-${Date.now()}-${this.counter}`;
  }
}
