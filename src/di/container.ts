import { CompleteEveningRitual } from '@/application/use-cases/complete-evening-ritual';
import { CompleteWeeklyChallenge } from '@/application/use-cases/complete-weekly-challenge';
import { CreateChildProfile } from '@/application/use-cases/create-child-profile';
import { GetChild } from '@/application/use-cases/get-child';
import { GetJournalEntries } from '@/application/use-cases/get-journal-entries';
import { GetTrophies } from '@/application/use-cases/get-trophies';
import { GetWeeklyChallenge } from '@/application/use-cases/get-weekly-challenge';
import { ListChildren } from '@/application/use-cases/list-children';
import { SetEveningReminder } from '@/application/use-cases/set-evening-reminder';
import { SequentialIdGenerator } from '@/infrastructure/ids/sequential-id-generator';
import { InMemoryChildRepository } from '@/infrastructure/persistence/in-memory/in-memory-child-repository';
import { InMemoryJournalEntryRepository } from '@/infrastructure/persistence/in-memory/in-memory-journal-entry-repository';
import { InMemoryTrophyRepository } from '@/infrastructure/persistence/in-memory/in-memory-trophy-repository';
import { InMemoryWeeklyChallengeRepository } from '@/infrastructure/persistence/in-memory/in-memory-weekly-challenge-repository';
import {
  seedChildren,
  seedJournalEntries,
  seedTrophies,
  seedWeeklyChallenges,
} from '@/infrastructure/persistence/in-memory/seed';
import { SystemClock } from '@/infrastructure/time/system-clock';

export interface AppServices {
  readonly createChildProfile: CreateChildProfile;
  readonly listChildren: ListChildren;
  readonly getChild: GetChild;
  readonly completeEveningRitual: CompleteEveningRitual;
  readonly getJournalEntries: GetJournalEntries;
  readonly getWeeklyChallenge: GetWeeklyChallenge;
  readonly completeWeeklyChallenge: CompleteWeeklyChallenge;
  readonly getTrophies: GetTrophies;
  readonly setEveningReminder: SetEveningReminder;
}

/**
 * Racine de composition : branche les cas d'usage sur les adaptateurs
 * en mémoire. Pour passer à une API, seuls les adaptateurs changent.
 */
export function createAppServices(): AppServices {
  const idGenerator = new SequentialIdGenerator('pousse');
  const clock = new SystemClock();

  const childRepository = new InMemoryChildRepository(seedChildren);
  const journalRepository = new InMemoryJournalEntryRepository(seedJournalEntries);
  const challengeRepository = new InMemoryWeeklyChallengeRepository(seedWeeklyChallenges);
  const trophyRepository = new InMemoryTrophyRepository(seedTrophies);

  return {
    createChildProfile: new CreateChildProfile(
      childRepository,
      challengeRepository,
      trophyRepository,
      idGenerator,
    ),
    listChildren: new ListChildren(childRepository),
    getChild: new GetChild(childRepository),
    completeEveningRitual: new CompleteEveningRitual(
      childRepository,
      journalRepository,
      idGenerator,
      clock,
    ),
    getJournalEntries: new GetJournalEntries(journalRepository),
    getWeeklyChallenge: new GetWeeklyChallenge(challengeRepository),
    completeWeeklyChallenge: new CompleteWeeklyChallenge(challengeRepository),
    getTrophies: new GetTrophies(trophyRepository),
    setEveningReminder: new SetEveningReminder(childRepository),
  };
}
