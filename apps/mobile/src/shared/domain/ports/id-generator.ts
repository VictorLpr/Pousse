/** Still used by RegisterParent only; moves to shared/infrastructure/ids/ with L2-2. */
export interface IdGenerator {
  next(): string;
}
