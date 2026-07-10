import type { AgeRange, Child } from '@/domain/entities/child';
import type { ChildRepository } from '@/domain/ports/child-repository';
import type { IdGenerator } from '@/domain/ports/id-generator';
import type { TrophyRepository } from '@/domain/ports/trophy-repository';
import type { WeeklyChallengeRepository } from '@/domain/ports/weekly-challenge-repository';

export interface CreateChildProfileInput {
  readonly firstName: string;
  readonly ageRange: AgeRange;
  readonly reminderTime: string;
}

const STARTER_CHALLENGE_TITLE = "Fais un compliment à quelqu'un que tu aimes";
const LOCKED_TROPHY_SLOTS = 2;

/**
 * Crée le profil et initialise l'univers de l'enfant :
 * son premier défi de la semaine et ses emplacements de trophées.
 */
export class CreateChildProfile {
  constructor(
    private readonly children: ChildRepository,
    private readonly challenges: WeeklyChallengeRepository,
    private readonly trophies: TrophyRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(input: CreateChildProfileInput): Promise<Child> {
    const firstName = input.firstName.trim();
    if (firstName.length === 0) {
      throw new Error('Le prénom est requis.');
    }

    const child: Child = {
      id: this.idGenerator.next(),
      firstName,
      ageRange: input.ageRange,
      reminder: { time: input.reminderTime, enabled: true },
      streakInEvenings: 0,
    };
    await this.children.save(child);

    await this.challenges.save({
      id: this.idGenerator.next(),
      childId: child.id,
      title: STARTER_CHALLENGE_TITLE,
      completedTogether: false,
    });

    for (let slot = 0; slot < LOCKED_TROPHY_SLOTS; slot += 1) {
      await this.trophies.save({
        id: this.idGenerator.next(),
        childId: child.id,
        name: 'À venir',
        status: 'locked',
      });
    }

    return child;
  }
}
