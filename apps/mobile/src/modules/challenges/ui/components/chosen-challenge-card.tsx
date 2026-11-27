import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AwardedBadge } from '@/modules/challenges/domain/entities/badge';
import type { ChildChallenge } from '@/modules/challenges/domain/entities/child-challenge';
import { ChallengeCelebration } from '@/modules/challenges/ui/components/challenge-celebration';
import { awardedBadgesMessage } from '@/modules/challenges/ui/format/badge';
import { OverlineLabel } from '@/shared/ui/components/overline-label';
import { colors, fonts } from '@/shared/ui/theme';

const CELEBRATION_MESSAGE = 'Bravo ! Vous avez relevé le défi ensemble.';

interface ChosenChallengeCardProps {
  childChallenge: ChildChallenge;
  /** True while the completion is being sent: the button can't be pressed twice. */
  isSubmitting: boolean;
  errorMessage: string | null;
  /** The badges the completion pressed here earned, announced with the congratulations. */
  awardedBadges: readonly AwardedBadge[];
  onComplete(): void;
}

/** The week's chosen challenge and the button that marks it done together. */
export function ChosenChallengeCard({
  childChallenge,
  isSubmitting,
  errorMessage,
  awardedBadges,
  onComplete,
}: ChosenChallengeCardProps) {
  const badgesMessage = awardedBadgesMessage(awardedBadges);
  const celebrationMessage = badgesMessage
    ? `${CELEBRATION_MESSAGE} ${badgesMessage}`
    : CELEBRATION_MESSAGE;
  const isCompleted = childChallenge.status === 'completed';
  const isDisabled = isCompleted || isSubmitting;

  // Celebrate only the completion pressed here: not a challenge that loads already
  // done, nor one completed on another device and picked up by a reload.
  const [isAwaitingCompletion, setIsAwaitingCompletion] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  if (isAwaitingCompletion && !isSubmitting) {
    setIsAwaitingCompletion(false);
    setIsCelebrating(isCompleted);
  }
  const complete = () => {
    setIsAwaitingCompletion(true);
    onComplete();
  };

  return (
    <View style={styles.challengeBlock}>
      <OverlineLabel>Le défi de la semaine</OverlineLabel>
      <Text style={styles.challengeTitle}>{childChallenge.challenge.title}</Text>
      <Text style={styles.challengeDescription}>{childChallenge.challenge.description}</Text>
      <ChallengeCelebration isCelebrating={isCelebrating} message={celebrationMessage}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isCompleted ? 'Défi relevé ensemble' : 'Marquer le défi comme fait ensemble'
          }
          accessibilityState={{ disabled: isDisabled, busy: isSubmitting }}
          disabled={isDisabled}
          onPress={complete}
          style={({ pressed }) => [
            styles.challengeButton,
            isCompleted && styles.challengeButtonDone,
            pressed && !isDisabled && styles.pressed,
          ]}
        >
          <Check size={20} color={colors.ink} strokeWidth={2.4} />
          <Text style={styles.challengeButtonLabel}>{buttonLabel(isCompleted, isSubmitting)}</Text>
        </Pressable>
      </ChallengeCelebration>
      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

function buttonLabel(isCompleted: boolean, isSubmitting: boolean): string {
  if (isCompleted) return 'Défi relevé ensemble !';
  return isSubmitting ? 'Un instant…' : "On l'a fait ensemble";
}

const styles = StyleSheet.create({
  challengeBlock: {
    gap: 12,
  },
  challengeTitle: {
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 34,
    color: colors.ink,
  },
  challengeDescription: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  challengeButton: {
    alignSelf: 'stretch',
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.peach,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 4,
  },
  challengeButtonDone: {
    backgroundColor: colors.coral,
  },
  pressed: {
    opacity: 0.8,
  },
  challengeButtonLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
  },
  error: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
  },
});
