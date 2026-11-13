import type { Child, NewChild } from '../entities/child';

export interface ChildRepository {
  findByParentId(parentId: string): Promise<Child[]>;
  findById(id: string): Promise<Child | null>;
  create(child: NewChild): Promise<Child>;
  save(child: Child): Promise<void>;
}
