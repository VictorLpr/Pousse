import { Redirect } from 'expo-router';
import { useState } from 'react';

import { useServices } from '@/di/services-provider';
import { useActiveChild } from '@/modules/auth/ui/state/active-child-context';
import { withBadgesAwarded, type AwardedBadge } from '@/modules/challenges/domain/entities/badge';
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

interface Awards {
  readonly childId: string;
  readonly badges: readonly AwardedBadge[];
}

/** What a choice or a completion sent back. */
interface Sent {
  readonly childChallenge: ChildChallenge;
  readonly awardedBadges: readonly AwardedBadge[];
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
    const [week, badges] = await Promise.all([
      services.getWeekChallenges.execute(childId, localDayOf(new Date())),
      services.getBadges.execute(childId),
    ]);
    return { week, badges };
  });
  // Keyed by child: switching child never shows another child's pending send or error.
  const [submission, setSubmission] = useState<Submission | null>(null);
  // The badges the last send earned, announced with the challenge's celebration.
  const [lastAwards, setLastAwards] = useState<Awards | null>(null);

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

  const { week, badges } = state.data;
  const takenChallenge = takenChallengeOf(week);

  const childId = activeChild.id;
  const current = submission?.childId === childId ? submission : null;
  const isSubmitting = current?.isSubmitting ?? false;
  const errorMessage = current?.errorMessage ?? null;

  const awardedBadges = lastAwards?.childId === childId ? lastAwards.badges : [];

  const submit = async (send: () => Promise<Sent>, fallback: string) => {
    setSubmission({ childId, isSubmitting: true, errorMessage: null });
    try {
      const { childChallenge, awardedBadges: awarded } = await send();
      update((data) => ({
        week: withUpdatedChallenge(data.week, childChallenge),
        badges: withBadgesAwarded(data.badges, awarded),
      }));
      setLastAwards({ childId, badges: awarded });
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
          awardedBadges={awardedBadges}
          onComplete={() =>
            submit(async () => {
              const { awardedBadges: awarded, ...childChallenge } =
                await services.completeChallenge.execute(takenChallenge.id);
              return { childChallenge, awardedBadges: awarded };
            }, 'Impossible de valider le défi, réessayez.')
          }
        />
      ) : (
        <WeekProposals
          proposals={week.challenges}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onChoose={(childChallengeId) =>
            submit(
              async () => ({
                childChallenge: await services.chooseChallenge.execute(childChallengeId),
                awardedBadges: [],
              }),
              'Impossible de choisir ce défi, réessayez.',
            )
          }
        />
      )}

      <Divider variant="sprout" spacing={28} />

      <BadgeShelf badges={badges} />
    </AppShell>
  );
}
