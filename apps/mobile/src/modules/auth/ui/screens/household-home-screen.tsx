import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { ChevronRight, Plus } from 'lucide-react-native';
import { Fragment, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Child } from '@/modules/auth/domain/entities/child';
import { useServices } from '@/di/services-provider';
import { Avatar } from '@/shared/ui/components/avatar';
import { Divider } from '@/shared/ui/components/divider';
import { ScreenContainer } from '@/shared/ui/components/screen-container';
import { ageRangeWithYears, childInitial } from '@/modules/auth/ui/format/child';
import { householdTitle } from '@/modules/auth/ui/format/household';
import { streakLabel } from '@/modules/journal/ui/format/streak';
import { useActiveChild } from '@/modules/auth/ui/state/active-child-context';
import { useEveningStreak } from '@/modules/journal/ui/hooks/use-evening-streak';
import { useSession } from '@/modules/auth/ui/state/session-context';
import { colors, fonts } from '@/shared/ui/theme';

export function HouseholdHomeScreen() {
  const router = useRouter();
  const services = useServices();
  const { account } = useSession();
  const { selectChild } = useActiveChild();
  const [children, setChildren] = useState<Child[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (account) {
        setErrorMessage(null);
        services.listChildren
          .execute(account.id)
          .then(setChildren)
          .catch(() => setErrorMessage('Impossible d’afficher les enfants, réessayez.'));
      }
    }, [services, account]),
  );

  if (!account) {
    return <Redirect href="/" />;
  }

  const chooseChild = async (childId: string) => {
    await selectChild(childId);
    router.push('/home');
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonsoir,</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {householdTitle(account)}
        </Text>
        <Text style={styles.subtitle}>Qui participe au rituel ce soir ?</Text>
      </View>

      <Divider variant="sprout" spacing={24} />

      {children.map((child, index) => (
        <Fragment key={child.id}>
          {index > 0 && <Divider />}
          <ChildRow child={child} onPress={() => chooseChild(child.id)} />
        </Fragment>
      ))}

      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}

      {children.length === 0 && !errorMessage && (
        <Text style={styles.emptyText}>
          Votre foyer est prêt ! Ajoutez le profil de votre premier enfant.
        </Text>
      )}

      <Divider variant="stitched" spacing={10} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajouter un enfant"
        onPress={() => router.push('/onboarding/child-profile?from=household')}
        style={({ pressed }) => [styles.addRow, pressed && styles.pressed]}
      >
        <Plus size={22} color={colors.moss} strokeWidth={1.9} />
        <Text style={styles.addLabel}>Ajouter un enfant</Text>
      </Pressable>
    </ScreenContainer>
  );
}

interface ChildRowProps {
  child: Child;
  onPress: () => void;
}

/** One child of the household, with the streak the journal computes. */
function ChildRow({ child, onPress }: ChildRowProps) {
  const streak = streakLabel(useEveningStreak(child.id));
  const details = [ageRangeWithYears(child.ageRange), streak].filter(Boolean).join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Commencer la soirée avec ${child.firstName}, ${ageRangeWithYears(child.ageRange)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.childRow, pressed && styles.pressed]}
    >
      <Avatar initial={childInitial(child.firstName)} size={56} />
      <View style={styles.childTexts}>
        <Text style={styles.childName}>{child.firstName}</Text>
        <Text style={styles.childDetails}>{details}</Text>
      </View>
      <ChevronRight size={20} color={colors.overline} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 2,
  },
  greeting: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkSoft,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 38,
    lineHeight: 42,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: 4,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  pressed: {
    opacity: 0.6,
  },
  childTexts: {
    flex: 1,
    gap: 2,
  },
  childName: {
    fontFamily: fonts.heading,
    fontSize: 26,
    lineHeight: 28,
    color: colors.ink,
  },
  childDetails: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
  },
  error: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
    paddingVertical: 18,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.inkSoft,
    paddingVertical: 18,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  addLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.moss,
  },
});
