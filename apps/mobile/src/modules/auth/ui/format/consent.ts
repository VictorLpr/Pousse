/**
 * Label of the guardian attestation box, naming the child once a first name
 * is typed, e.g. "Je suis le parent… de Léa… (version 1.0)". The version shown
 * is the one sent with the consent.
 */
export function guardianConsentLabel(policyVersion: string, childFirstName: string): string {
  const firstName = childFirstName.trim();
  const child = firstName.length > 0 ? firstName : 'cet enfant';
  return `Je suis le parent ou le représentant légal de ${child}, et j'accepte que ses données soient gardées comme l'explique la politique de confidentialité de Pousse (version ${policyVersion}).`;
}
