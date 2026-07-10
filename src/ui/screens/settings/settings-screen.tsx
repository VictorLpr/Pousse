import { Redirect, useRouter } from 'expo-router';
import {
  Bell,
  CircleQuestionMark,
  Image as ImageIcon,
  Lock,
  Users,
} from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useServices } from '@/di/services-provider';
import { Avatar } from '@/ui/components/avatar';
import { Divider } from '@/ui/components/divider';
import { ScreenContainer } from '@/ui/components/screen-container';
import { ScreenHeader } from '@/ui/components/screen-header';
import { SettingsRow } from '@/ui/components/settings-row';
import { ageRangeWithYears, childInitial, reminderLabel } from '@/ui/format/child';
import { useActiveChild } from '@/ui/state/active-child-context';
import { colors, fonts } from '@/ui/theme';

function showComingSoon() {
  Alert.alert('Bientôt disponible', 'Cette section arrive dans une prochaine version.');
}

export function SettingsScreen() {
  const router = useRouter();
  const services = useServices();
  const { activeChild, adoptChild, isLoading } = useActiveChild();

  if (isLoading) {
    return <ScreenContainer scrollable={false}>{null}</ScreenContainer>;
  }
  if (!activeChild) {
    return <Redirect href="/" />;
  }

  const toggleReminder = async (enabled: boolean) => {
    adoptChild(await services.setEveningReminder.execute(activeChild.id, enabled));
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Préférences" />

      <View style={styles.profileRow}>
        <Avatar initial={childInitial(activeChild.firstName)} size={56} />
        <View style={styles.profileTexts}>
          <Text style={styles.profileName}>{activeChild.firstName}</Text>
          <Text style={styles.profileAge}>{ageRangeWithYears(activeChild.ageRange)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Changer d'enfant"
          onPress={() => router.push('/children')}
          style={({ pressed }) => [styles.switchLink, pressed && styles.pressed]}
          hitSlop={8}>
          <Users size={16} color={colors.inkSoft} strokeWidth={1.9} />
          <Text style={styles.switchLinkLabel}>Changer</Text>
        </Pressable>
      </View>

      <Divider variant="sprout" spacing={24} />

      <SettingsRow
        icon={<Bell size={20} color={colors.ink} strokeWidth={1.9} />}
        title="Rappel du soir"
        subtitle={reminderLabel(activeChild)}
        trailing={
          <Switch
            accessibilityLabel="Activer le rappel du soir"
            value={activeChild.reminder.enabled}
            onValueChange={toggleReminder}
            trackColor={{ false: colors.border, true: colors.coral }}
            thumbColor={colors.surface}
          />
        }
      />
      <Divider />
      <SettingsRow
        icon={<ImageIcon size={20} color={colors.ink} strokeWidth={1.9} />}
        title="Galerie des souvenirs"
        onPress={() => router.push('/gallery')}
      />
      <Divider />
      <SettingsRow
        icon={<Lock size={20} color={colors.ink} strokeWidth={1.9} />}
        title="Confidentialité"
        accessibilityHint="Bientôt disponible"
        onPress={showComingSoon}
      />
      <Divider />
      <SettingsRow
        icon={<CircleQuestionMark size={20} color={colors.ink} strokeWidth={1.9} />}
        title="Aide & contact"
        accessibilityHint="Bientôt disponible"
        onPress={showComingSoon}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileTexts: {
    flex: 1,
  },
  profileName: {
    fontFamily: fonts.heading,
    fontSize: 26,
    lineHeight: 28,
    color: colors.ink,
  },
  profileAge: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
  },
  switchLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pressed: {
    opacity: 0.6,
  },
  switchLinkLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.inkSoft,
    textDecorationLine: 'underline',
  },
});
