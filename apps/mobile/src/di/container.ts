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
import { HttpChildRepository } from '@/modules/auth/infrastructure/http/http-child-repository';
import { HttpConsentRepository } from '@/modules/auth/infrastructure/http/http-consent-repository';
import type { ParentAuthClient } from '@/modules/auth/infrastructure/http/parent-auth-client';
import type { ChildRepository } from '@/modules/auth/domain/ports/child-repository';
import type { ConsentRepository } from '@/modules/auth/domain/ports/consent-repository';
import { API_BASE_URL } from '@/shared/infrastructure/http/api-base-url';
import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import { SequentialIdGenerator } from '@/shared/infrastructure/ids/sequential-id-generator';
import type { AuthGateway } from '@/modules/auth/domain/ports/auth-gateway';
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
 * The app talks to the API, except under `expo start` without an API URL:
 * the dev preview has no Worker to forward `/api`, so it keeps the whole fake
 * backend (in-memory adapters and their demo accounts). Never a mix: the fake
 * backend's ids mean nothing to the API.
 */
const USES_FAKE_BACKEND = __DEV__ && !API_URL;

/** What every HTTP adapter shares: the BetterAuth client and the one HTTP client. */
interface ApiConnection {
  readonly authClient: ParentAuthClient;
  readonly http: HttpClient;
}

/**
 * Built once. Business requests carry the session cookie the auth client
 * keeps: on native, `sessionCookie()` reads it from secure storage; on the
 * web it returns `null` and the browser sends its `HttpOnly` cookie.
 */
function connectToApi(): ApiConnection {
  const setup = createAuthClientSetup(API_URL);
  return {
    authClient: setup.client,
    http: new FetchHttpClient({ baseUrl: API_BASE_URL, sessionCookie: setup.sessionCookie }),
  };
}

interface ChildAdapters {
  readonly children: ChildRepository;
  readonly consents: ConsentRepository;
}

function createChildAdapters(
  api: ApiConnection | null,
  idGenerator: SequentialIdGenerator,
  clock: SystemClock,
): ChildAdapters {
  if (api) {
    return {
      children: new HttpChildRepository(api.http),
      consents: new HttpConsentRepository(api.http),
    };
  }
  const consents = new InMemoryConsentRepository(seedConsents, clock);
  return {
    children: new InMemoryChildRepository(seedChildren, consents, idGenerator, clock),
    consents,
  };
}

/**
 * Composition root: wires use cases to their adapters. Auth, children and
 * consent go to the API (`connectToApi`) unless the fake backend is on; the
 * other in-memory adapters still act as a fake backend: like the API, they
 * generate ids and timestamps. Switching to the API only changes the adapters.
 */
export function createAppServices(): AppServices {
  const idGenerator = new SequentialIdGenerator('pousse');
  const clock = new SystemClock();
  const api = USES_FAKE_BACKEND ? null : connectToApi();

  const authGateway: AuthGateway = api
    ? new BetterAuthGateway(api.authClient)
    : new InMemoryAuthGateway(new InMemoryParentAccountRepository(seedParentAccounts), idGenerator);
  // No use case reads the consent yet: the child profile screens will.
  const { children: childRepository } = createChildAdapters(api, idGenerator, clock);
  const journalRepository = new InMemoryJournalEntryRepository(
    seedJournalEntries,
    seedEmotions,
    async (childId) => (await childRepository.findById(childId)) !== null,
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
    hasDemoAccounts: USES_FAKE_BACKEND,
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
