import { useRouter } from 'expo-router';
import { Check, Plus } from 'lucide-react-native';
import { Fragment, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Child } from '@/domain/entities/child';
import { useServices } from '@/di/services-provider';
import { Avatar } from '@/ui/components/avatar';
import { Divider } from '@/ui/components/divider';
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

      {children.map((child, index) => {
        const isActive = child.id === activeChild?.id;
        return (
          <Fragment key={child.id}>
            {index > 0 && <Divider />}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Choisir ${child.firstName}, ${ageRangeWithYears(child.ageRange)}`}
              accessibilityState={{ selected: isActive }}
              onPress={() => chooseChild(child.id)}
              style={({ pressed }) => [styles.childRow, pressed && styles.pressed]}>
              <Avatar
                initial={childInitial(child.firstName)}
                size={56}
                backgroundColor={isActive ? colors.peach : colors.sage}
              />
              <View style={styles.childTexts}>
                <Text style={styles.childName}>{child.firstName}</Text>
                <Text style={styles.childDetails}>
                  {ageRangeWithYears(child.ageRange)} · {streakLabel(child)}
                </Text>
              </View>
              {isActive && <Check size={22} color={colors.ink} strokeWidth={2.4} />}
            </Pressable>
          </Fragment>
        );
      })}

      <Divider variant="stitched" spacing={10} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajouter un enfant"
        onPress={() => router.push('/onboarding/child-profile')}
        style={({ pressed }) => [styles.addRow, pressed && styles.pressed]}>
        <Plus size={22} color={colors.moss} strokeWidth={1.9} />
        <Text style={styles.addLabel}>Ajouter un enfant</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
