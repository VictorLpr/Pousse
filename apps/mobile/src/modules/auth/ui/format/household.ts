import type { ParentProfile } from '@/modules/auth/domain/entities/parent-account';

/** E.g. "le foyer Dupont", or "votre foyer" while the parent has no last name. */
export function householdLabel(parent: ParentProfile): string {
  const lastName = parent.lastName?.trim();
  return lastName ? `le foyer ${lastName}` : 'votre foyer';
}

/** E.g. "Le foyer Dupont", or "Votre foyer" while the parent has no last name. */
export function householdTitle(parent: ParentProfile): string {
  const label = householdLabel(parent);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
