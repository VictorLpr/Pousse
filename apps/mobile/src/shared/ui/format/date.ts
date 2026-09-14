const FULL_DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const SHORT_DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
});

const MONTH_FORMAT = new Intl.DateTimeFormat('fr-FR', { month: 'long' });

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Ex. « Mardi 8 juillet ». */
export function formatFullDate(date: Date): string {
  return capitalize(FULL_DATE_FORMAT.format(date));
}

/** Ex. « 8 juil. ». */
export function formatShortDate(date: Date): string {
  return SHORT_DATE_FORMAT.format(date);
}

/** Ex. « Juillet ». */
export function formatMonth(date: Date): string {
  return capitalize(MONTH_FORMAT.format(date));
}
