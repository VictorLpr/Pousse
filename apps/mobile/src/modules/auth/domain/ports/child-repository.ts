import type { Child, NewChild } from '../entities/child';
import type { ConsentGrant } from '../entities/consent';

export interface ChildRepository {
  findByParentId(parentId: string): Promise<Child[]>;
  findById(id: string): Promise<Child | null>;
  /** The consent is recorded with the profile, in the same call. */
  create(child: NewChild, consent: ConsentGrant): Promise<Child>;
  save(child: Child): Promise<void>;
}
