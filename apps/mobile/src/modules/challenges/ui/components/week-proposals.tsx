import { Fragment, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ChildChallenge } from '@/modules/challenges/domain/entities/child-challenge';
import { ChallengeCard } from '@/modules/challenges/ui/components/challenge-card';
import { AppButton } from '@/shared/ui/components/app-button';
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

/**
 * The week's three proposals, before one is chosen. Picking a card only opens
 * the confirmation under it: the choice is final, so it is sent on « Oui ».
 */
export function WeekProposals({
  proposals,
  isSubmitting,
  errorMessage,
  onChoose,
}: WeekProposalsProps) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  // A reload may bring other proposals: a pick that isn't among them is dropped.
  const selectedId = proposals.some((proposal) => proposal.id === pickedId) ? pickedId : null;
  // The error belongs to the card that was sent: picking another one hides it.
  const [sentId, setSentId] = useState<string | null>(null);
  const showsError = selectedId === null || selectedId === sentId;

  const error =
    errorMessage && showsError ? (
      <Text accessibilityRole="alert" style={styles.error}>
        {errorMessage}
      </Text>
    ) : null;

  return (
    <View style={styles.block}>
      <OverlineLabel>Choisis ton défi de la semaine</OverlineLabel>
      <View accessibilityRole="radiogroup" accessibilityLabel="Les 3 défis de la semaine">
        {proposals.map((proposal, index) => {
          const selected = proposal.id === selectedId;
          return (
            <Fragment key={proposal.id}>
              {index > 0 ? <Divider /> : null}
              <ChallengeCard
                challenge={proposal.challenge}
                selected={selected}
                disabled={isSubmitting}
                onPress={() => setPickedId(proposal.id)}
              />
              {selected ? (
                <View accessibilityLiveRegion="polite" style={styles.confirmation}>
                  <View style={styles.quoteBar} />
                  <View style={styles.confirmationBody}>
                    <Text accessibilityRole="header" style={styles.question}>
                      C’est ton défi de la semaine ?
                    </Text>
                    <Text style={styles.reminder}>
                      Tu le gardes toute la semaine : on ne pourra plus le changer.
                    </Text>
                    <AppButton
                      label="Oui, c’est mon défi"
                      accessibilityHint="Le choix vaut pour toute la semaine."
                      disabled={isSubmitting}
                      onPress={() => {
                        setSentId(proposal.id);
                        onChoose(proposal.id);
                      }}
                    />
                    <AppButton
                      label="Je regarde encore"
                      variant="ghost"
                      disabled={isSubmitting}
                      onPress={() => setPickedId(null)}
                    />
                    {error}
                  </View>
                </View>
              ) : null}
            </Fragment>
          );
        })}
      </View>
      {selectedId ? null : error}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 8,
  },
  confirmation: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quoteBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.coral,
  },
  confirmationBody: {
    flex: 1,
    gap: 6,
  },
  question: {
    fontFamily: fonts.heading,
    fontSize: 26,
    lineHeight: 30,
    color: colors.ink,
  },
  reminder: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.inkSoft,
    marginBottom: 6,
  },
  error: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
  },
});
