import {
  MAX_CHILD_AGE,
  MIN_CHILD_AGE,
  type Child,
  type NewChild,
} from '@/modules/auth/domain/entities/child';
import {
  MAX_POLICY_VERSION_LENGTH,
  type ConsentGrant,
} from '@/modules/auth/domain/entities/consent';
import { AuthError } from '@/modules/auth/domain/errors/auth-error';
import type { ChildRepository } from '@/modules/auth/domain/ports/child-repository';
import {
  ageOn,
  ageRangeOf,
  isCalendarDate,
  utcDay,
} from '@/modules/auth/infrastructure/persistence/in-memory/child-age';
import type { InMemoryConsentRepository } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-consent-repository';
import type { IdGenerator } from '@/shared/infrastructure/ids/id-generator';
import type { Clock } from '@/shared/infrastructure/time/clock';

/** A stored child: the age range is never stored, it is computed on read. */
export type ChildRecord = NewChild & { readonly id: string };

/**
 * Fake children API (`/children`): same rules, codes and English messages.
 * A child is 4 to 12 years old when the profile is created and when its
 * birth date is corrected; the age range is computed on every read, so it
 * moves on as the child grows. A profile is created with its parental
 * consent, which is recorded along with it and never updated.
 */
export class InMemoryChildRepository implements ChildRepository {
  private readonly recordsById = new Map<string, ChildRecord>();

  constructor(
    seed: readonly ChildRecord[],
    private readonly consents: InMemoryConsentRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {
    seed.forEach((record) => this.recordsById.set(record.id, record));
  }

  async findByParentId(parentId: string): Promise<Child[]> {
    return [...this.recordsById.values()]
      .filter((record) => record.parentId === parentId)
      .map((record) => this.toChild(record));
  }

  async findById(id: string): Promise<Child | null> {
    const record = this.recordsById.get(id);
    return record ? this.toChild(record) : null;
  }

  async create(newChild: NewChild, consent: ConsentGrant): Promise<Child> {
    this.assertAgeInRange(newChild.birthDate);
    const grant = this.validConsent(consent);
    const record: ChildRecord = { ...newChild, id: this.idGenerator.next() };
    // Consent first: like the API's transaction, no child is stored without one.
    this.consents.record(record.id, grant);
    this.recordsById.set(record.id, record);
    return this.toChild(record);
  }

  async save(child: Child): Promise<void> {
    const { ageRange: _computed, ...record } = child;
    if (record.birthDate !== this.recordsById.get(record.id)?.birthDate) {
      this.assertAgeInRange(record.birthDate);
    }
    this.recordsById.set(record.id, record);
  }

  private assertAgeInRange(birthDate: string): void {
    if (!isCalendarDate(birthDate)) {
      throw new AuthError('BIRTH_DATE_INVALID', 'Invalid birth date');
    }
    const age = ageOn(birthDate, this.today());
    if (age < MIN_CHILD_AGE || age > MAX_CHILD_AGE) {
      throw new AuthError(
        'CHILD_AGE_OUT_OF_RANGE',
        `A child must be ${MIN_CHILD_AGE} to ${MAX_CHILD_AGE} years old`,
      );
    }
  }

  /**
   * Same rule as the API's schema: an attestation that is `true`, a 1-10
   * character version. `undefined` is checked too, as the API checks a body
   * that comes without `consent`.
   */
  private validConsent(consent: ConsentGrant | undefined): ConsentGrant {
    if (consent?.guardianAttested !== true) {
      throw new AuthError(
        'GUARDIAN_ATTESTATION_REQUIRED',
        'The parent must attest being the legal guardian',
      );
    }
    const policyVersion = consent.policyVersion.trim();
    if (policyVersion.length === 0 || policyVersion.length > MAX_POLICY_VERSION_LENGTH) {
      throw new AuthError(
        'POLICY_VERSION_INVALID',
        `The policy version must be 1 to ${MAX_POLICY_VERSION_LENGTH} characters`,
      );
    }
    return { policyVersion, guardianAttested: true };
  }

  private toChild(record: ChildRecord): Child {
    return { ...record, ageRange: ageRangeOf(ageOn(record.birthDate, this.today())) };
  }

  private today(): string {
    return utcDay(this.clock.now());
  }
}
