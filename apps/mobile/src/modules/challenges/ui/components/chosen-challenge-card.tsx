import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ChildChallenge } from '@/modules/challenges/domain/entities/child-challenge';
import { OverlineLabel } from '@/shared/ui/components/overline-label';
import { colors, fonts } from '@/shared/ui/theme';

interface ChosenChallengeCardProps {
  childChallenge: ChildChallenge;
  /** True while the completion is being sent: the button can't be pressed twice. */
  isSubmitting: boolean;
  errorMessage: string | null;
  onComplete(): void;
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

  return (
    <View style={styles.challengeBlock}>
      <OverlineLabel>Le défi de la semaine</OverlineLabel>
      <Text style={styles.challengeTitle}>{childChallenge.challenge.title}</Text>
      <Text style={styles.challengeDescription}>{childChallenge.challenge.description}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isCompleted ? 'Défi relevé ensemble' : 'Marquer le défi comme fait ensemble'
        }
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onPress={onComplete}
        style={({ pressed }) => [
          styles.challengeButton,
          isCompleted && styles.challengeButtonDone,
          pressed && !isDisabled && styles.pressed,
        ]}
      >
        <Check size={17} color={colors.ink} strokeWidth={2.4} />
        <Text style={styles.challengeButtonLabel}>
          {isCompleted ? 'Défi relevé ensemble !' : "On l'a fait ensemble"}
        </Text>
      </Pressable>
      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.peach,
    borderRadius: 18,
    paddingVertical: 14,
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
    fontSize: 14,
    color: colors.ink,
  },
  error: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
  },
});
