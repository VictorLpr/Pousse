import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ChildChallenge } from '@/modules/challenges/domain/entities/child-challenge';
import { Divider } from '@/shared/ui/components/divider';
import { OverlineLabel } from '@/shared/ui/components/overline-label';
import { colors, fonts } from '@/shared/ui/theme';

interface WeekProposalsProps {
  proposals: readonly ChildChallenge[];
  /** True while a choice is being sent: no second choice meanwhile. */
  isSubmitting: boolean;
  errorMessage: string | null;
  onChoose(childChallengeId: string): void;
}

/** The week's three proposals, before one is chosen. */
export function WeekProposals({
  proposals,
  isSubmitting,
  errorMessage,
  onChoose,
}: WeekProposalsProps) {
  return (
    <View style={styles.block}>
      <OverlineLabel>Choisis ton défi de la semaine</OverlineLabel>
      {proposals.map((proposal, index) => (
        <Fragment key={proposal.id}>
          {index > 0 ? <Divider /> : null}
          <View style={styles.proposal}>
            <Text style={styles.title}>{proposal.challenge.title}</Text>
            <Text style={styles.description}>{proposal.challenge.description}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Choisir le défi : ${proposal.challenge.title}`}
              accessibilityHint="Le choix vaut pour toute la semaine."
              accessibilityState={{ disabled: isSubmitting }}
              disabled={isSubmitting}
              onPress={() => onChoose(proposal.id)}
              style={({ pressed }) => [styles.chooseButton, pressed && styles.pressed]}
            >
              <Text style={styles.chooseLabel}>Choisir ce défi</Text>
            </Pressable>
          </View>
        </Fragment>
      ))}
      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 16,
  },
  proposal: {
    gap: 6,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 26,
    lineHeight: 30,
    color: colors.ink,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  chooseButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 3,
    borderBottomColor: colors.coral,
  },
  pressed: {
    opacity: 0.7,
  },
  chooseLabel: {
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
