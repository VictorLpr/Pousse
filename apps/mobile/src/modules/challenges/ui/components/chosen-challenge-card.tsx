import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type {
  ChildChallenge,
  ChildChallengeStatus,
} from '@/modules/challenges/domain/entities/child-challenge';
import { ChallengeCelebration } from '@/modules/challenges/ui/components/challenge-celebration';
import { OverlineLabel } from '@/shared/ui/components/overline-label';
import { colors, fonts } from '@/shared/ui/theme';

const CELEBRATION_MESSAGE = 'Bravo ! Vous avez relevé le défi ensemble.';

interface ChosenChallengeCardProps {
  childChallenge: ChildChallenge;
  /** True while the completion is being sent: the button can't be pressed twice. */
  isSubmitting: boolean;
  errorMessage: string | null;
  onComplete(): void;
}

interface ShownChallenge {
  readonly id: string;
  readonly status: ChildChallengeStatus;
}

/** The week's chosen challenge and the button that marks it done together. */
export function ChosenChallengeCard({
  childChallenge,
  isSubmitting,
  errorMessage,
  onComplete,
}: ChosenChallengeCardProps) {
  const isCompleted = childChallenge.status === 'completed';
  const isDisabled = isCompleted || isSubmitting;

  // Celebrate only a completion seen on this screen, not a challenge that loads already done.
  const [shown, setShown] = useState<ShownChallenge>(childChallenge);
  const [isCelebrating, setIsCelebrating] = useState(false);
  if (shown.id !== childChallenge.id || shown.status !== childChallenge.status) {
    setIsCelebrating(shown.id === childChallenge.id && shown.status === 'chosen' && isCompleted);
    setShown({ id: childChallenge.id, status: childChallenge.status });
  }

  return (
    <View style={styles.challengeBlock}>
      <OverlineLabel>Le défi de la semaine</OverlineLabel>
      <Text style={styles.challengeTitle}>{childChallenge.challenge.title}</Text>
      <Text style={styles.challengeDescription}>{childChallenge.challenge.description}</Text>
      <ChallengeCelebration isCelebrating={isCelebrating} message={CELEBRATION_MESSAGE}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isCompleted ? 'Défi relevé ensemble' : 'Marquer le défi comme fait ensemble'
          }
          accessibilityState={{ disabled: isDisabled, busy: isSubmitting }}
          disabled={isDisabled}
          onPress={onComplete}
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
