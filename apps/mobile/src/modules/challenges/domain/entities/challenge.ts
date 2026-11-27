/** The catalog's categories, as the API's `challenge_category` enum. */
export type ChallengeCategory = 'helping' | 'creativity' | 'learning' | 'politeness';

/** Who a challenge suits: `4-12` challenges are drawn for every child. */
export type ChallengeAgeRange = '4-7' | '8-12' | '4-12';

/** A child's own range, computed by the backend from the birth date. */
export type ChildAgeRange = Exclude<ChallengeAgeRange, '4-12'>;

/** A catalog challenge, as `GET /challenges/week` nests it. */
export interface Challenge {
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly category: ChallengeCategory;
  readonly ageRange: ChallengeAgeRange;
}
