import type { AgeRange, Child, NewChild } from '@/modules/auth/domain/entities/child';
import type { Consent, ConsentGrant } from '@/modules/auth/domain/entities/consent';

/** A child as `/children` returns it (`childResponse` on the API). */
export interface ChildDto {
  readonly id: string;
  readonly firstName: string;
  readonly birthDate: string;
  readonly ageRange: AgeRange;
  readonly avatar: string | null;
  readonly reminderTime: string;
  readonly reminderEnabled: boolean;
}

/** `GET /children/:id/consent` (`consentResponse` on the API). */
export interface ConsentDto {
  /** ISO 8601 date-time. */
  readonly givenAt: string;
  readonly policyVersion: string;
}

/** Body of `POST /children`: the API takes the parent from the session. */
export interface CreateChildBody {
  readonly firstName: string;
  readonly birthDate: string;
  readonly avatar?: string;
  readonly reminderTime: string;
  readonly reminderEnabled: boolean;
  readonly consent: ConsentGrant;
}

/** Body of `PATCH /children/:id`: only the fields that change. */
export interface UpdateChildBody {
  firstName?: string;
  birthDate?: string;
  /** `null` removes the avatar. */
  avatar?: string | null;
  reminderTime?: string;
  reminderEnabled?: boolean;
}

export function toChild(dto: ChildDto): Child {
  return {
    id: dto.id,
    firstName: dto.firstName,
    birthDate: dto.birthDate,
    ageRange: dto.ageRange,
    avatar: dto.avatar,
    reminder: { time: dto.reminderTime, enabled: dto.reminderEnabled },
  };
}

export function toConsent(childId: string, dto: ConsentDto): Consent {
  return { childId, policyVersion: dto.policyVersion, givenAt: new Date(dto.givenAt) };
}

export function toCreateChildBody(child: NewChild, consent: ConsentGrant): CreateChildBody {
  return {
    firstName: child.firstName,
    birthDate: child.birthDate,
    ...(child.avatar === null ? {} : { avatar: child.avatar }),
    reminderTime: child.reminder.time,
    reminderEnabled: child.reminder.enabled,
    consent: { policyVersion: consent.policyVersion, guardianAttested: consent.guardianAttested },
  };
}

/**
 * The fields of `next` that differ from `current`. The API checks the age
 * again whenever `birthDate` is sent, so an unchanged one stays out: a child
 * past twelve can still have their reminder switched.
 */
export function toUpdateChildBody(current: Child, next: Child): UpdateChildBody {
  const body: UpdateChildBody = {};
  if (next.firstName !== current.firstName) body.firstName = next.firstName;
  if (next.birthDate !== current.birthDate) body.birthDate = next.birthDate;
  if (next.avatar !== current.avatar) body.avatar = next.avatar;
  if (next.reminder.time !== current.reminder.time) body.reminderTime = next.reminder.time;
  if (next.reminder.enabled !== current.reminder.enabled) {
    body.reminderEnabled = next.reminder.enabled;
  }
  return body;
}
