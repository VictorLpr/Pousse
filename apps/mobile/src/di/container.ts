import { CompleteEveningRitual } from '@/modules/journal/application/use-cases/complete-evening-ritual';
import { CompleteWeeklyChallenge } from '@/modules/defis/application/use-cases/complete-weekly-challenge';
import { CreateChildProfile } from '@/modules/auth/application/use-cases/create-child-profile';
import { CreateHousehold } from '@/modules/auth/application/use-cases/create-household';
import { GetChild } from '@/modules/auth/application/use-cases/get-child';
import { GetJournalEntries } from '@/modules/journal/application/use-cases/get-journal-entries';
import { GetTrophies } from '@/modules/defis/application/use-cases/get-trophies';
import { GetWeeklyChallenge } from '@/modules/defis/application/use-cases/get-weekly-challenge';
import { InitializeChildProgress } from '@/modules/defis/application/use-cases/initialize-child-progress';
import { ListChildren } from '@/modules/auth/application/use-cases/list-children';
import { RegisterParent } from '@/modules/auth/application/use-cases/register-parent';
import { SetEveningReminder } from '@/modules/auth/application/use-cases/set-evening-reminder';
import { SignInParent } from '@/modules/auth/application/use-cases/sign-in-parent';
import { SequentialIdGenerator } from '@/shared/infrastructure/ids/sequential-id-generator';
import { InMemoryChildRepository } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-child-repository';
import { InMemoryHouseholdRepository } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-household-repository';
import { InMemoryJournalEntryRepository } from '@/modules/journal/infrastructure/persistence/in-memory/in-memory-journal-entry-repository';
import { InMemoryParentAccountRepository } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-parent-account-repository';
import { InMemoryTrophyRepository } from '@/modules/defis/infrastructure/persistence/in-memory/in-memory-trophy-repository';
import { InMemoryWeeklyChallengeRepository } from '@/modules/defis/infrastructure/persistence/in-memory/in-memory-weekly-challenge-repository';
import {
  seedChildren,
  seedHouseholds,
  seedParentAccounts,
} from '@/modules/auth/infrastructure/persistence/in-memory/seed';
import { seedTrophies, seedWeeklyChallenges } from '@/modules/defis/infrastructure/persistence/in-memory/seed';
import { seedJournalEntries } from '@/modules/journal/infrastructure/persistence/in-memory/seed';
import { SystemClock } from '@/shared/infrastructure/time/system-clock';

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
  const initializeChildProgress = new InitializeChildProgress(
    challengeRepository,
    trophyRepository,
    idGenerator,
  );

  return {
    signInParent: new SignInParent(accountRepository, householdRepository),
    registerParent: new RegisterParent(accountRepository, idGenerator),
    createHousehold: new CreateHousehold(householdRepository, accountRepository, idGenerator),
    createChildProfile: new CreateChildProfile(childRepository, idGenerator, initializeChildProgress),
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
