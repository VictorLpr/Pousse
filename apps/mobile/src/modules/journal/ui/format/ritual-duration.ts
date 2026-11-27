/** How long the evening ritual takes, in minutes: the one source every screen shows. */
export const RITUAL_DURATION_MINUTES = { min: 5, max: 10 } as const;

/** E.g. "5 à 10 min", for the visible copy. */
export function ritualDurationLabel(): string {
  return `${RITUAL_DURATION_MINUTES.min} à ${RITUAL_DURATION_MINUTES.max} min`;
}

/** E.g. "5 à 10 minutes", for screen readers, which may not expand "min". */
export function ritualDurationSpokenLabel(): string {
  return `${RITUAL_DURATION_MINUTES.min} à ${RITUAL_DURATION_MINUTES.max} minutes`;
}
