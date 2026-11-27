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
import { PickRitualPhoto } from '@/modules/journal/application/use-cases/pick-ritual-photo';
import { RegisterParent } from '@/modules/auth/application/use-cases/register-parent';
import { RestoreSession } from '@/modules/auth/application/use-cases/restore-session';
import { SetEveningReminder } from '@/modules/auth/application/use-cases/set-evening-reminder';
import { SignInParent } from '@/modules/auth/application/use-cases/sign-in-parent';
import { SignOutParent } from '@/modules/auth/application/use-cases/sign-out-parent';
import { UpdateParentName } from '@/modules/auth/application/use-cases/update-parent-name';
import { BetterAuthGateway } from '@/modules/auth/infrastructure/http/better-auth-gateway';
import { createAuthClientSetup } from '@/modules/auth/infrastructure/http/auth-client-setup';
import type { AuthClientSetup } from '@/modules/auth/infrastructure/http/parent-auth-client';
import { SequentialIdGenerator } from '@/shared/infrastructure/ids/sequential-id-generator';
import type { AuthGateway } from '@/modules/auth/domain/ports/auth-gateway';
import type { EmotionCatalog } from '@/modules/journal/domain/ports/emotion-catalog';
import type { JournalEntryRepository } from '@/modules/journal/domain/ports/journal-entry-repository';
import { HttpEmotionCatalog } from '@/modules/journal/infrastructure/http/http-emotion-catalog';
import { HttpJournalEntryRepository } from '@/modules/journal/infrastructure/http/http-journal-entry-repository';
import { API_BASE_URL } from '@/shared/infrastructure/http/api-base-url';
import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import { InMemoryAuthGateway } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-auth-gateway';
import { InMemoryChildRepository } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-child-repository';
import { InMemoryConsentRepository } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-consent-repository';
import { InMemoryEmotionCatalog } from '@/modules/journal/infrastructure/persistence/in-memory/in-memory-emotion-catalog';
import { InMemoryJournalEntryRepository } from '@/modules/journal/infrastructure/persistence/in-memory/in-memory-journal-entry-repository';
import { PlaceholderPhotoPicker } from '@/modules/journal/infrastructure/device/placeholder-photo-picker';
import { InMemoryParentAccountRepository } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory-parent-account-repository';
import { InMemoryTrophyRepository } from '@/modules/challenges/infrastructure/persistence/in-memory/in-memory-trophy-repository';
import { InMemoryWeeklyChallengeRepository } from '@/modules/challenges/infrastructure/persistence/in-memory/in-memory-weekly-challenge-repository';
import {
  seedChildren,
  seedConsents,
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
  /** True while auth runs on the fake backend, whose demo accounts the login screen lists. */
  readonly hasDemoAccounts: boolean;
  readonly restoreSession: RestoreSession;
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
  readonly pickRitualPhoto: PickRitualPhoto;
  readonly getWeeklyChallenge: GetWeeklyChallenge;
  readonly completeWeeklyChallenge: CompleteWeeklyChallenge;
  readonly getTrophies: GetTrophies;
  readonly setEveningReminder: SetEveningReminder;
}

/**
 * The API's public URL (e.g. `https://…/api`), inlined at bundle time.
 * Required by a native build; the web app falls back to `/api` on its own
 * origin, forwarded to the API by the Worker (ADR-0011). The API answers no
 * CORS: on the web, only a URL on the page's own origin works.
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Auth (BetterAuth) and the journal go to the API, except under
 * `expo start` without an API URL: the dev preview has no Worker to forward
 * `/api`, so it keeps the fake backend and its demo accounts.
 */
const USES_FAKE_AUTH = __DEV__ && !API_URL;

/**
 * The BetterAuth client and the one HTTP client of the business adapters,
 * built once: business requests carry the session of that same client
 * (`sessionCookie()`, native only).
 */
function connectToApi(): { readonly authSetup: AuthClientSetup; readonly http: HttpClient } {
  const authSetup = createAuthClientSetup(API_URL);
  const http = new FetchHttpClient({
    baseUrl: API_BASE_URL,
    sessionCookie: () => authSetup.sessionCookie(),
  });
  return { authSetup, http };
}

/**
 * Composition root: wires use cases to their adapters. Auth and the journal
 * go to the API; the other in-memory adapters act as a fake backend: like
 * the API, they generate ids and timestamps. Switching to the API only
 * changes the adapters.
 */
export function createAppServices(): AppServices {
  const idGenerator = new SequentialIdGenerator('pousse');
  const clock = new SystemClock();
  const api = USES_FAKE_AUTH ? null : connectToApi();

  const accountRepository = new InMemoryParentAccountRepository(seedParentAccounts);
  const authGateway: AuthGateway = api
    ? new BetterAuthGateway(api.authSetup.client)
    : new InMemoryAuthGateway(accountRepository, idGenerator);
  const consentRepository = new InMemoryConsentRepository(seedConsents, clock);
  const childRepository = new InMemoryChildRepository(
    seedChildren,
    consentRepository,
    idGenerator,
    clock,
  );
  const journalRepository: JournalEntryRepository = api
    ? new HttpJournalEntryRepository(api.http)
    : new InMemoryJournalEntryRepository(
        seedJournalEntries,
        seedEmotions,
        async (childId) => (await childRepository.findById(childId)) !== null,
        idGenerator,
        clock,
      );
  const emotionCatalog: EmotionCatalog = api
    ? new HttpEmotionCatalog(api.http)
    : new InMemoryEmotionCatalog(seedEmotions);
  const challengeRepository = new InMemoryWeeklyChallengeRepository(
    seedWeeklyChallenges,
    challengeTitlePool,
    idGenerator,
  );
  const trophyRepository = new InMemoryTrophyRepository(seedTrophies, idGenerator);

  return {
    hasDemoAccounts: USES_FAKE_AUTH,
    restoreSession: new RestoreSession(authGateway),
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
    pickRitualPhoto: new PickRitualPhoto(new PlaceholderPhotoPicker()),
    getWeeklyChallenge: new GetWeeklyChallenge(challengeRepository),
    completeWeeklyChallenge: new CompleteWeeklyChallenge(challengeRepository),
    getTrophies: new GetTrophies(trophyRepository),
    setEveningReminder: new SetEveningReminder(childRepository),
  };
}
