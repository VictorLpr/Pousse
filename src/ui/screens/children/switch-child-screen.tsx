import { useRouter } from 'expo-router';
import { Check, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Child } from '@/domain/entities/child';
import { useServices } from '@/di/services-provider';
import { Avatar } from '@/ui/components/avatar';
import { ScreenContainer } from '@/ui/components/screen-container';
import { ScreenHeader } from '@/ui/components/screen-header';
import { ageRangeWithYears, childInitial, streakLabel } from '@/ui/format/child';
import { useActiveChild } from '@/ui/state/active-child-context';
import { colors, fonts } from '@/ui/theme';

export function SwitchChildScreen() {
  const router = useRouter();
  const services = useServices();
  const { activeChild, selectChild } = useActiveChild();
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    services.listChildren.execute().then(setChildren);
  }, [services]);

  const chooseChild = async (childId: string) => {
    await selectChild(childId);
    router.back();
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Qui ce soir ?" subtitle="Choisissez un enfant" />

      <View style={styles.list}>
        {children.map((child) => {
          const isActive = child.id === activeChild?.id;
          return (
            <Pressable
              key={child.id}
              accessibilityRole="button"
              accessibilityLabel={`Choisir ${child.firstName}, ${ageRangeWithYears(child.ageRange)}`}
              accessibilityState={{ selected: isActive }}
              onPress={() => chooseChild(child.id)}
              style={({ pressed }) => [
                styles.childCard,
                isActive && styles.activeChildCard,
                pressed && styles.pressed,
              ]}>
              <Avatar
                initial={childInitial(child.firstName)}
                size={52}
                backgroundColor={isActive ? colors.background : colors.sage}
              />
              <View style={styles.childTexts}>
                <Text style={styles.childName}>{child.firstName}</Text>
                <Text style={styles.childDetails}>
                  {ageRangeWithYears(child.ageRange)} · {streakLabel(child)}
                </Text>
              </View>
              {isActive && (
                <View style={styles.checkCircle}>
                  <Check size={16} color={colors.ink} strokeWidth={2.6} />
                </View>
              )}
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajouter un enfant"
          onPress={() => router.push('/onboarding/child-profile')}
          style={({ pressed }) => [styles.addCard, pressed && styles.pressed]}>
          <Plus size={22} color={colors.moss} strokeWidth={1.9} />
          <Text style={styles.addLabel}>Ajouter un enfant</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 14,
  },
  activeChildCard: {
    backgroundColor: colors.peach,
    borderColor: colors.coral,
  },
  pressed: {
    opacity: 0.85,
  },
  childTexts: {
    flex: 1,
    gap: 3,
  },
  childName: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.ink,
  },
  childDetails: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.dashedBorder,
    borderRadius: 20,
    padding: 18,
  },
  addLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.moss,
  },
});
