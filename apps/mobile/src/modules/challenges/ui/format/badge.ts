import type { Badge } from '@/modules/challenges/domain/entities/badge';
import { formatDayMonth } from '@/shared/ui/format/date';

/**
 * « Badge Premier soir, obtenu le 21 novembre. Tu as raconté ta première
 * soirée. » or « Badge Curieux, pas encore obtenu. ». The catalog's
 * descriptions say what the child did, so only an earned badge reads it.
 */
export function badgeAccessibilityLabel(badge: Badge): string {
  if (!badge.awardedAt) return `Badge ${badge.label}, pas encore obtenu.`;
  const label = `Badge ${badge.label}, obtenu le ${formatDayMonth(badge.awardedAt)}.`;
  return badge.description ? `${label} ${badge.description}` : label;
}

/** « 1 obtenu », « 4 obtenus ». */
export function awardedCountLabel(count: number): string {
  return `${count} obtenu${count > 1 ? 's' : ''}`;
}

/**
 * « Nouveau badge : Premier soir ! », « Nouveaux badges : Premier défi et
 * Entraide ! »; null when nothing was earned.
 */
export function awardedBadgesMessage(badges: readonly Pick<Badge, 'label'>[]): string | null {
  if (badges.length === 0) return null;
  const labels = badges.map(({ label }) => label);
  const names =
    labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(', ')} et ${labels.at(-1)}`;
  // Non-breaking spaces before « : » and « ! », as French typography wants: the
  // « ! » never wraps alone.
  return `${badges.length === 1 ? 'Nouveau badge' : 'Nouveaux badges'} : ${names} !`;
}
