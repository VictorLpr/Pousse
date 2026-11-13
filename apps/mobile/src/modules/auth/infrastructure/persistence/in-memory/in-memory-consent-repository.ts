import type { Consent, ConsentGrant } from '@/modules/auth/domain/entities/consent';
import type { ConsentRepository } from '@/modules/auth/domain/ports/consent-repository';
import type { Clock } from '@/shared/infrastructure/time/clock';

/**
 * Fake consent store (`GET /children/:id/consent`). Only the fake children
 * API writes to it, when a profile is created; nothing ever updates it.
 */
export class InMemoryConsentRepository implements ConsentRepository {
  private readonly consentsByChildId = new Map<string, Consent>();

  constructor(
    seed: readonly Consent[],
    private readonly clock: Clock,
  ) {
    seed.forEach((consent) => this.consentsByChildId.set(consent.childId, consent));
  }

  async findByChildId(childId: string): Promise<Consent | null> {
    return this.consentsByChildId.get(childId) ?? null;
  }

  /** Adapter-only: the port exposes no write, as the API exposes no route. */
  record(childId: string, grant: ConsentGrant): Consent {
    if (this.consentsByChildId.has(childId)) {
      throw new Error(`Child ${childId} already has a consent`);
    }
    const consent: Consent = {
      childId,
      policyVersion: grant.policyVersion,
      givenAt: this.clock.now(),
    };
    this.consentsByChildId.set(childId, consent);
    return consent;
  }
}
