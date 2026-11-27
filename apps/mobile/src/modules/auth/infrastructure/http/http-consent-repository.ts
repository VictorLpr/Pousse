import type { Consent } from '@/modules/auth/domain/entities/consent';
import type { ConsentRepository } from '@/modules/auth/domain/ports/consent-repository';
import { isUnknownChild } from '@/modules/auth/infrastructure/http/child-api-error';
import { toConsent, type ConsentDto } from '@/modules/auth/infrastructure/http/child-dto';
import { ApiError } from '@/shared/infrastructure/http/api-error';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';

/**
 * `ConsentRepository` over `GET /children/:id/consent`. The API records the
 * consent with the profile (`POST /children`) and has no route to change it.
 */
export class HttpConsentRepository implements ConsentRepository {
  constructor(private readonly http: HttpClient) {}

  /** `null` for a profile created before consent was required, or no such child. */
  async findByChildId(childId: string): Promise<Consent | null> {
    try {
      const consent = await this.http.get<ConsentDto>(
        `/children/${encodeURIComponent(childId)}/consent`,
      );
      return toConsent(childId, consent);
    } catch (error) {
      if (isUnknownChild(error) || isMissingConsent(error)) {
        return null;
      }
      throw error;
    }
  }
}

function isMissingConsent(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'CONSENT_NOT_FOUND';
}
