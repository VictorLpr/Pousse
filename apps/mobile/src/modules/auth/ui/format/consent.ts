/**
 * Label of the guardian attestation box, e.g. "Je suis son parent… (version
 * 1.0)". The version shown is the one sent with the consent.
 */
export function guardianConsentLabel(policyVersion: string): string {
  return `Je suis son parent ou son représentant légal, et j'accepte la politique de confidentialité de Pousse (version ${policyVersion}).`;
}
