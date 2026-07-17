import { CompleteEveningRitual } from '@/application/use-cases/complete-evening-ritual';
import { CompleteWeeklyChallenge } from '@/application/use-cases/complete-weekly-challenge';
import { CreateChildProfile } from '@/application/use-cases/create-child-profile';
import { CreateHousehold } from '@/application/use-cases/create-household';
import { GetChild } from '@/application/use-cases/get-child';
import { GetJournalEntries } from '@/application/use-cases/get-journal-entries';
import { GetTrophies } from '@/application/use-cases/get-trophies';
import { GetWeeklyChallenge } from '@/application/use-cases/get-weekly-challenge';
import { ListChildren } from '@/application/use-cases/list-children';
import { RegisterParent } from '@/application/use-cases/register-parent';
import { SetEveningReminder } from '@/application/use-cases/set-evening-reminder';
import { SignInParent } from '@/application/use-cases/sign-in-parent';
import { SequentialIdGenerator } from '@/infrastructure/ids/sequential-id-generator';
import { InMemoryChildRepository } from '@/infrastructure/persistence/in-memory/in-memory-child-repository';
import { InMemoryHouseholdRepository } from '@/infrastructure/persistence/in-memory/in-memory-household-repository';
import { InMemoryJournalEntryRepository } from '@/infrastructure/persistence/in-memory/in-memory-journal-entry-repository';
import { InMemoryParentAccountRepository } from '@/infrastructure/persistence/in-memory/in-memory-parent-account-repository';
import { InMemoryTrophyRepository } from '@/infrastructure/persistence/in-memory/in-memory-trophy-repository';
import { InMemoryWeeklyChallengeRepository } from '@/infrastructure/persistence/in-memory/in-memory-weekly-challenge-repository';
import {
  seedChildren,
  seedHouseholds,
  seedJournalEntries,
  seedParentAccounts,
  seedTrophies,
  seedWeeklyChallenges,
} from '@/infrastructure/persistence/in-memory/seed';
import { SystemClock } from '@/infrastructure/time/system-clock';

export interface AppServices {
  readonly signInParent: SignInParent;
  readonly registerParent: RegisterParent;
  readonly createHousehold: CreateHousehold;
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

  const accountRepository = new InMemoryParentAccountRepository(seedParentAccounts);
  const householdRepository = new InMemoryHouseholdRepository(seedHouseholds);
  const childRepository = new InMemoryChildRepository(seedChildren);
  const journalRepository = new InMemoryJournalEntryRepository(seedJournalEntries);
  const challengeRepository = new InMemoryWeeklyChallengeRepository(seedWeeklyChallenges);
  const trophyRepository = new InMemoryTrophyRepository(seedTrophies);

  return {
    signInParent: new SignInParent(accountRepository, householdRepository),
    registerParent: new RegisterParent(accountRepository, idGenerator),
    createHousehold: new CreateHousehold(householdRepository, accountRepository, idGenerator),
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
