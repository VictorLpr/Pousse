import type { AgeRange, Child } from '@/modules/auth/domain/entities/child';
import type { ChildRepository } from '@/modules/auth/domain/ports/child-repository';
import type { InitializeChildProgress } from '@/modules/defis';
import type { IdGenerator } from '@/shared/domain/ports/id-generator';

export interface CreateChildProfileInput {
  readonly householdId: string;
  readonly firstName: string;
  readonly ageRange: AgeRange;
  readonly reminderTime: string;
}

/**
 * Crée le profil enfant, puis délègue au module défis l'initialisation de
 * son premier défi et de ses emplacements de trophées : ce module ne touche
 * jamais directement au dépôt de données d'un autre module (voir AGENTS.md).
 */
export class CreateChildProfile {
  constructor(
    private readonly children: ChildRepository,
    private readonly idGenerator: IdGenerator,
    private readonly initializeChildProgress: InitializeChildProgress,
  ) {}

  async execute(input: CreateChildProfileInput): Promise<Child> {
    const firstName = input.firstName.trim();
    if (firstName.length === 0) {
      throw new Error('Le prénom est requis.');
    }

    const child: Child = {
      id: this.idGenerator.next(),
      householdId: input.householdId,
      firstName,
      ageRange: input.ageRange,
      reminder: { time: input.reminderTime, enabled: true },
      streakInEvenings: 0,
    };
    await this.children.save(child);
    await this.initializeChildProgress.execute(child.id);

    return child;
  }
}
