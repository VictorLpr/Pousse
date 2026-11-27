import { Redirect } from 'expo-router';
import { useState } from 'react';

import { useServices } from '@/di/services-provider';
import { useActiveChild } from '@/modules/auth/ui/state/active-child-context';
import {
  takenChallengeOf,
  type ChildChallenge,
  type WeekChallenges,
} from '@/modules/challenges/domain/entities/child-challenge';
import { ChallengeError } from '@/modules/challenges/domain/errors/challenge-error';
import { BadgeShelf } from '@/modules/challenges/ui/components/badge-shelf';
import { ChosenChallengeCard } from '@/modules/challenges/ui/components/chosen-challenge-card';
import { WeekProposals } from '@/modules/challenges/ui/components/week-proposals';
import { challengeErrorMessage } from '@/modules/challenges/ui/format/challenge-error';
import { localDayOf } from '@/modules/journal';
import { AppShell } from '@/shared/ui/components/app-shell';
import { Divider } from '@/shared/ui/components/divider';
import { LoadStatus } from '@/shared/ui/components/load-status';
import { ScreenContainer } from '@/shared/ui/components/screen-container';
import { ScreenHeader } from '@/shared/ui/components/screen-header';
import { useAsyncData } from '@/shared/ui/hooks/use-async-data';

interface Submission {
  readonly childId: string;
  readonly isSubmitting: boolean;
  readonly errorMessage: string | null;
}

/** The week changed elsewhere since it loaded: what is on screen can't be acted on. */
function isStaleWeekError(error: unknown): boolean {
  return (
    error instanceof ChallengeError &&
    (error.code === 'CHALLENGE_ALREADY_CHOSEN' || error.code === 'INVALID_CHALLENGE_TRANSITION')
  );
}

function withUpdatedChallenge(week: WeekChallenges, updated: ChildChallenge): WeekChallenges {
  return {
    ...week,
    challenges: week.challenges.map((current) => (current.id === updated.id ? updated : current)),
  };
}

export function ChallengesScreen() {
  const services = useServices();
  const { activeChild, isLoading } = useActiveChild();
  const { state, retry, update } = useAsyncData(activeChild?.id ?? null, async (childId) => {
    const [week, trophies] = await Promise.all([
      services.getWeekChallenges.execute(childId, localDayOf(new Date())),
      services.getTrophies.execute(childId),
    ]);
    return { week, trophies };
  });
  // Keyed by child: switching child never shows another child's pending send or error.
  const [submission, setSubmission] = useState<Submission | null>(null);

  if (isLoading) {
    return <ScreenContainer scrollable={false}>{null}</ScreenContainer>;
  }
  if (!activeChild) {
    return <Redirect href="/" />;
  }

  if (state.status !== 'ready') {
    return (
      <AppShell route="challenges">
        <ScreenHeader title={`Les défis de ${activeChild.firstName}`} />
        <LoadStatus
          status={state.status}
          loadingLabel="Chargement des défis"
          errorMessage="Impossible d'afficher les défis pour l'instant."
          onRetry={retry}
        />
      </AppShell>
    );
  }

  const { week, trophies } = state.data;
  const takenChallenge = takenChallengeOf(week);

  const childId = activeChild.id;
  const current = submission?.childId === childId ? submission : null;
  const isSubmitting = current?.isSubmitting ?? false;
  const errorMessage = current?.errorMessage ?? null;

  const submit = async (send: () => Promise<ChildChallenge>, fallback: string) => {
    setSubmission({ childId, isSubmitting: true, errorMessage: null });
    try {
      const updated = await send();
      update((data) => ({ ...data, week: withUpdatedChallenge(data.week, updated) }));
      setSubmission(null);
    } catch (error) {
      setSubmission({
        childId,
        isSubmitting: false,
        errorMessage: challengeErrorMessage(error, fallback),
      });
      if (isStaleWeekError(error)) {
        // Another device chose or completed meanwhile: show the week as it now is.
        retry();
      }
    }
  };

  return (
    <AppShell route="challenges">
      <ScreenHeader title={`Les défis de ${activeChild.firstName}`} />

      {takenChallenge ? (
        <ChosenChallengeCard
          childChallenge={takenChallenge}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onComplete={() =>
            submit(
              () => services.completeChallenge.execute(takenChallenge.id),
              'Impossible de valider le défi, réessayez.',
            )
          }
        />
      ) : (
        <WeekProposals
          proposals={week.challenges}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onChoose={(childChallengeId) =>
            submit(
              () => services.chooseChallenge.execute(childChallengeId),
              'Impossible de choisir ce défi, réessayez.',
            )
          }
        />
      )}

      <Divider variant="sprout" spacing={28} />

      <BadgeShelf trophies={trophies} />
    </AppShell>
  );
}
