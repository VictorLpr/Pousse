import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { ChevronRight, Plus } from 'lucide-react-native';
import { Fragment, useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Child } from '@/modules/auth/domain/entities/child';
import { useServices } from '@/di/services-provider';
import { Avatar } from '@/shared/ui/components/avatar';
import { Divider } from '@/shared/ui/components/divider';
import { LoadStatus } from '@/shared/ui/components/load-status';
import { ScreenContainer } from '@/shared/ui/components/screen-container';
import { ageRangeWithYears, childInitial } from '@/modules/auth/ui/format/child';
import { householdTitle } from '@/modules/auth/ui/format/household';
import { streakLabel } from '@/modules/journal/ui/format/streak';
import { useActiveChild } from '@/modules/auth/ui/state/active-child-context';
import { useAsyncData } from '@/shared/ui/hooks/use-async-data';
import { useEveningStreak } from '@/modules/journal/ui/hooks/use-evening-streak';
import { useSession } from '@/modules/auth/ui/state/session-context';
import { colors, fonts } from '@/shared/ui/theme';

export function HouseholdHomeScreen() {
  const router = useRouter();
  const services = useServices();
  const { account } = useSession();
  const { selectChild, isLoading: isSelecting } = useActiveChild();
  const { state, retry } = useAsyncData(account?.id ?? null, (parentId) =>
    services.listChildren.execute(parentId),
  );
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => setSelectionError(null), []));

  if (!account) {
    return <Redirect href="/" />;
  }

  const chooseChild = async (child: Child) => {
    setSelectionError(null);
    setSelectedChildId(child.id);
    try {
      await selectChild(child.id);
      router.push('/home');
    } catch {
      setSelectionError(`Impossible d’ouvrir la soirée de ${child.firstName}, réessayez.`);
    } finally {
      setSelectedChildId(null);
    }
  };

  const children = state.status === 'ready' ? state.data : [];

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

      <LoadStatus
        status={state.status}
        loadingLabel="Chargement des enfants"
        errorMessage="Impossible d’afficher les enfants pour l’instant."
        onRetry={retry}
      />

      {children.map((child, index) => (
        <Fragment key={child.id}>
          {index > 0 && <Divider />}
          <ChildRow
            child={child}
            isDisabled={isSelecting}
            isSelecting={selectedChildId === child.id}
            onPress={() => chooseChild(child)}
          />
        </Fragment>
      ))}

      {selectionError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {selectionError}
        </Text>
      ) : null}

      {state.status === 'ready' && children.length === 0 && (
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
  /** A child is being opened: no second tap until it settles. */
  isDisabled: boolean;
  /** This child is the one being opened. */
  isSelecting: boolean;
  onPress: () => void;
}

/** One child of the household, with the streak the journal computes. */
function ChildRow({ child, isDisabled, isSelecting, onPress }: ChildRowProps) {
  const streak = streakLabel(useEveningStreak(child.id));
  const details = [ageRangeWithYears(child.ageRange), streak].filter(Boolean).join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Commencer la soirée avec ${child.firstName}, ${ageRangeWithYears(child.ageRange)}`}
      accessibilityState={{ disabled: isDisabled }}
      aria-busy={isSelecting}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [styles.childRow, pressed && !isDisabled && styles.pressed]}
    >
      <Avatar initial={childInitial(child.firstName)} size={56} />
      <View style={styles.childTexts}>
        <Text style={styles.childName}>{child.firstName}</Text>
        <Text style={styles.childDetails}>{details}</Text>
      </View>
      {isSelecting ? (
        <ActivityIndicator color={colors.moss} />
      ) : (
        <ChevronRight size={20} color={colors.overline} strokeWidth={2} />
      )}
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
