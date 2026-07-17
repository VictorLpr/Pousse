import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { ChevronRight, Plus } from 'lucide-react-native';
import { Fragment, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Child } from '@/domain/entities/child';
import { useServices } from '@/di/services-provider';
import { Avatar } from '@/ui/components/avatar';
import { Divider } from '@/ui/components/divider';
import { ScreenContainer } from '@/ui/components/screen-container';
import { ageRangeWithYears, childInitial, streakLabel } from '@/ui/format/child';
import { useActiveChild } from '@/ui/state/active-child-context';
import { useSession } from '@/ui/state/session-context';
import { colors, fonts } from '@/ui/theme';

export function HouseholdHomeScreen() {
  const router = useRouter();
  const services = useServices();
  const { household } = useSession();
  const { selectChild } = useActiveChild();
  const [children, setChildren] = useState<Child[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (household) {
        services.listChildren.execute(household.id).then(setChildren);
      }
    }, [services, household]),
  );

  if (!household) {
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
          Le foyer {household.name}
        </Text>
        <Text style={styles.subtitle}>Qui participe au rituel ce soir ?</Text>
      </View>

      <Divider variant="sprout" spacing={24} />

      {children.map((child, index) => (
        <Fragment key={child.id}>
          {index > 0 && <Divider />}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Commencer la soirée avec ${child.firstName}, ${ageRangeWithYears(child.ageRange)}`}
            onPress={() => chooseChild(child.id)}
            style={({ pressed }) => [styles.childRow, pressed && styles.pressed]}>
            <Avatar initial={childInitial(child.firstName)} size={56} />
            <View style={styles.childTexts}>
              <Text style={styles.childName}>{child.firstName}</Text>
              <Text style={styles.childDetails}>
                {ageRangeWithYears(child.ageRange)} · {streakLabel(child)}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.overline} strokeWidth={2} />
          </Pressable>
        </Fragment>
      ))}

      {children.length === 0 && (
        <Text style={styles.emptyText}>
          Votre foyer est prêt ! Ajoutez le profil de votre premier enfant.
        </Text>
      )}

      <Divider variant="stitched" spacing={10} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajouter un enfant"
        onPress={() => router.push('/onboarding/child-profile?from=foyer')}
        style={({ pressed }) => [styles.addRow, pressed && styles.pressed]}>
        <Plus size={22} color={colors.moss} strokeWidth={1.9} />
        <Text style={styles.addLabel}>Ajouter un enfant</Text>
      </Pressable>
    </ScreenContainer>
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
