export type TrophyStatus = 'earned' | 'locked';

export interface Trophy {
  readonly id: string;
  readonly childId: string;
  readonly name: string;
  readonly status: TrophyStatus;
}
