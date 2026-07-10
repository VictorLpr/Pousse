import type { Child } from '../entities/child';

export interface ChildRepository {
  findAll(): Promise<Child[]>;
  findById(id: string): Promise<Child | null>;
  save(child: Child): Promise<void>;
}
