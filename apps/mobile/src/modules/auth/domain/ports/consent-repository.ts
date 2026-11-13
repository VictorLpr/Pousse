import type { Consent } from '../entities/consent';

/**
 * Read-only on purpose: a consent is recorded with the child profile
 * (`ChildRepository.create`) and never updated. Don't add a write method.
 */
export interface ConsentRepository {
  /** `null` for a profile created before consent was required. */
  findByChildId(childId: string): Promise<Consent | null>;
}
