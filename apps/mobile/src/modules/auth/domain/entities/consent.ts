/**
 * Version of the privacy policy the parent accepts when creating a child
 * profile. The single source for every screen that shows or sends it.
 */
export const PRIVACY_POLICY_VERSION = '1.0';

/** The API stores the policy version in a `varchar(10)`. */
export const MAX_POLICY_VERSION_LENGTH = 10;

/**
 * What the parent gives when creating a child profile (GDPR, under 15): the
 * policy version accepted and the attestation of being the child's legal
 * guardian, which can only be `true`.
 */
export interface ConsentGrant {
  readonly policyVersion: string;
  readonly guardianAttested: true;
}

/**
 * Proof of the parental consent, one per child. Given with the profile and
 * never updated afterwards: a new policy version means a new consent flow.
 */
export interface Consent {
  readonly childId: string;
  readonly policyVersion: string;
  readonly givenAt: Date;
}
