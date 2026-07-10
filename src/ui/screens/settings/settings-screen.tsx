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

      <View style={styles.profileCard}>
        <Avatar initial={childInitial(activeChild.firstName)} size={48} />
        <View style={styles.profileTexts}>
          <Text style={styles.profileName}>{activeChild.firstName}</Text>
          <Text style={styles.profileAge}>{ageRangeWithYears(activeChild.ageRange)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Changer d'enfant"
          onPress={() => router.push('/children')}
          style={({ pressed }) => [styles.switchChip, pressed && styles.pressed]}>
          <Users size={16} color={colors.ink} strokeWidth={1.9} />
          <Text style={styles.switchChipLabel}>Changer</Text>
        </Pressable>
      </View>

      <View style={styles.rows}>
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
        <SettingsRow
          icon={<ImageIcon size={20} color={colors.ink} strokeWidth={1.9} />}
          title="Galerie des souvenirs"
          onPress={() => router.push('/gallery')}
        />
        <SettingsRow
          icon={<Lock size={20} color={colors.ink} strokeWidth={1.9} />}
          title="Confidentialité"
          accessibilityHint="Bientôt disponible"
          onPress={showComingSoon}
        />
        <SettingsRow
          icon={<CircleQuestionMark size={20} color={colors.ink} strokeWidth={1.9} />}
          title="Aide & contact"
          accessibilityHint="Bientôt disponible"
          onPress={showComingSoon}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.sage,
    borderRadius: 20,
    padding: 14,
    marginBottom: 22,
  },
  profileTexts: {
    flex: 1,
  },
  profileName: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
  },
  profileAge: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
  },
  switchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.8,
  },
  switchChipLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.ink,
  },
  rows: {
    gap: 10,
  },
});
