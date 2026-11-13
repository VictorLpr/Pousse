import { CompleteEveningRitual } from '@/modules/journal/application/use-cases/complete-evening-ritual';
import { CompleteWeeklyChallenge } from '@/modules/challenges/application/use-cases/complete-weekly-challenge';
import { CreateChildProfile } from '@/modules/auth/application/use-cases/create-child-profile';
import { GetChild } from '@/modules/auth/application/use-cases/get-child';
import { GetEveningStreak } from '@/modules/journal/application/use-cases/get-evening-streak';
import { GetJournalEntries } from '@/modules/journal/application/use-cases/get-journal-entries';
import { GetTrophies } from '@/modules/challenges/application/use-cases/get-trophies';
import { GetWeeklyChallenge } from '@/modules/challenges/application/use-cases/get-weekly-challenge';
import { ListChildren } from '@/modules/auth/application/use-cases/list-children';
import { ListEmotions } from '@/modules/journal/application/use-cases/list-emotions';
import { RegisterParent } from '@/modules/auth/application/use-cases/register-parent';
import { SetEveningReminder } from '@/modules/auth/application/use-cases/set-evening-reminder';
import { SignInParent } from '@/modules/auth/application/use-cases/sign-in-parent';
import { SignOutParent } from '@/modules/auth/application/use-cases/sign-out-parent';
import { UpdateParentName } from '@/modules/auth/application/use-cases/update-parent-name';
import { SequentialIdGenerator } from '@/shared/infrastructure/ids/sequential-id-generator';
import { InMemoryAuthGateway } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-auth-gateway';
import { InMemoryChildRepository } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-child-repository';
import { InMemoryEmotionCatalog } from '@/modules/journal/infrastructure/persistence/in-memory/in-memory-emotion-catalog';
import { InMemoryJournalEntryRepository } from '@/modules/journal/infrastructure/persistence/in-memory/in-memory-journal-entry-repository';
import { InMemoryParentAccountRepository } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-parent-account-repository';
import { InMemoryTrophyRepository } from '@/modules/challenges/infrastructure/persistence/in-memory/in-memory-trophy-repository';
import { InMemoryWeeklyChallengeRepository } from '@/modules/challenges/infrastructure/persistence/in-memory/in-memory-weekly-challenge-repository';
import {
  seedChildren,
  seedParentAccounts,
} from '@/modules/auth/infrastructure/persistence/in-memory/seed';
import {
  challengeTitlePool,
  seedTrophies,
  seedWeeklyChallenges,
} from '@/modules/challenges/infrastructure/persistence/in-memory/seed';
import {
  seedEmotions,
  seedJournalEntries,
} from '@/modules/journal/infrastructure/persistence/in-memory/seed';
import { SystemClock } from '@/shared/infrastructure/time/system-clock';

export interface AppServices {
  readonly signInParent: SignInParent;
  readonly registerParent: RegisterParent;
  readonly signOutParent: SignOutParent;
  readonly updateParentName: UpdateParentName;
  readonly createChildProfile: CreateChildProfile;
  readonly listChildren: ListChildren;
  readonly getChild: GetChild;
  readonly completeEveningRitual: CompleteEveningRitual;
  readonly getJournalEntries: GetJournalEntries;
  readonly getEveningStreak: GetEveningStreak;
  readonly listEmotions: ListEmotions;
  readonly getWeeklyChallenge: GetWeeklyChallenge;
  readonly completeWeeklyChallenge: CompleteWeeklyChallenge;
  readonly getTrophies: GetTrophies;
  readonly setEveningReminder: SetEveningReminder;
}

/**
 * Composition root: wires use cases to the in-memory adapters. These act as
 * a fake backend: like the API, they generate ids and timestamps. Switching
 * to the API only changes the adapters.
 */
export function createAppServices(): AppServices {
  const idGenerator = new SequentialIdGenerator('pousse');
  const clock = new SystemClock();

  const accountRepository = new InMemoryParentAccountRepository(seedParentAccounts);
  const authGateway = new InMemoryAuthGateway(accountRepository, idGenerator);
  const childRepository = new InMemoryChildRepository(seedChildren, idGenerator, clock);
  const journalRepository = new InMemoryJournalEntryRepository(
    seedJournalEntries,
    idGenerator,
    clock,
  );
  const emotionCatalog = new InMemoryEmotionCatalog(seedEmotions);
  const challengeRepository = new InMemoryWeeklyChallengeRepository(
    seedWeeklyChallenges,
    challengeTitlePool,
    idGenerator,
  );
  const trophyRepository = new InMemoryTrophyRepository(seedTrophies, idGenerator);

  return {
    signInParent: new SignInParent(authGateway),
    registerParent: new RegisterParent(authGateway),
    signOutParent: new SignOutParent(authGateway),
    updateParentName: new UpdateParentName(authGateway),
    createChildProfile: new CreateChildProfile(childRepository),
    listChildren: new ListChildren(childRepository),
    getChild: new GetChild(childRepository),
    completeEveningRitual: new CompleteEveningRitual(journalRepository),
    getJournalEntries: new GetJournalEntries(journalRepository),
    getEveningStreak: new GetEveningStreak(journalRepository),
    listEmotions: new ListEmotions(emotionCatalog),
    getWeeklyChallenge: new GetWeeklyChallenge(challengeRepository),
    completeWeeklyChallenge: new CompleteWeeklyChallenge(challengeRepository),
    getTrophies: new GetTrophies(trophyRepository),
    setEveningReminder: new SetEveningReminder(childRepository),
  };
}
