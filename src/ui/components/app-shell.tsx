import { useRouter } from 'expo-router';
import {
  BookOpen,
  ChevronDown,
  House,
  Image as ImageIcon,
  Settings,
  Sprout,
  Trophy,
} from 'lucide-react-native';
import { createContext, useContext, type ComponentType, type PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/ui/components/avatar';
import { Divider } from '@/ui/components/divider';
import { ScreenContainer } from '@/ui/components/screen-container';
import { childInitial } from '@/ui/format/child';
import { useWideLayout } from '@/ui/hooks/use-wide-layout';
import { useActiveChild } from '@/ui/state/active-child-context';
import { useRitualDraft } from '@/ui/state/ritual-draft-context';
import { colors, fonts } from '@/ui/theme';

export type ShellRoute = 'home' | 'journal' | 'challenges' | 'gallery' | 'settings';

/** Vrai quand l'écran est rendu dans le shell tablette (sidebar visible). */
const ShellContext = createContext(false);

export function useInShell(): boolean {
  return useContext(ShellContext);
}

interface AppShellProps extends PropsWithChildren {
  route: ShellRoute;
}

interface NavIconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

interface NavItem {
  route: ShellRoute;
  label: string;
  icon: ComponentType<NavIconProps>;
  href: '/home' | '/journal' | '/challenges' | '/gallery';
}

const NAV_ITEMS: readonly NavItem[] = [
  { route: 'home', label: 'Accueil', icon: House, href: '/home' },
  { route: 'journal', label: 'Journal', icon: BookOpen, href: '/journal' },
  { route: 'challenges', label: 'Défis', icon: Trophy, href: '/challenges' },
  { route: 'gallery', label: 'Galerie', icon: ImageIcon, href: '/gallery' },
];

/**
 * Gabarit des écrans principaux : plein écran sur mobile,
 * sidebar persistante + colonne de contenu à partir du point de rupture tablette.
 */
export function AppShell({ route, children }: AppShellProps) {
  const isWide = useWideLayout();
  const router = useRouter();
  const { activeChild } = useActiveChild();
  const { resetDraft } = useRitualDraft();

  if (!isWide) {
    return <ScreenContainer>{children}</ScreenContainer>;
  }

  const startRitual = () => {
    resetDraft();
    router.push('/ritual/emotion');
  };

  return (
    <ShellContext.Provider value>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.row}>
          <View style={styles.sidebar}>
            <Text accessibilityRole="header" style={styles.logo}>
              Pousse
            </Text>

            {activeChild && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Enfant actif : ${activeChild.firstName}. Changer d'enfant`}
                onPress={() => router.push('/household')}
                style={({ pressed }) => [styles.childSwitcher, pressed && styles.pressed]}
              >
                <Avatar initial={childInitial(activeChild.firstName)} size={34} />
                <Text style={styles.childName}>{activeChild.firstName}</Text>
                <ChevronDown size={16} color={colors.inkSoft} strokeWidth={2} />
              </Pressable>
            )}

            <Divider spacing={18} />

            <View style={styles.nav}>
              {NAV_ITEMS.map((item) => {
                const selected = item.route === route;
                const Icon = item.icon;
                return (
                  <Pressable
                    key={item.route}
                    accessibilityRole="button"
                    accessibilityLabel={`Ouvrir ${item.label}`}
                    accessibilityState={{ selected }}
                    onPress={() => router.replace(item.href)}
                    style={({ pressed }) => [
                      styles.navItem,
                      selected && styles.navItemActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Icon size={20} color={colors.ink} strokeWidth={1.9} />
                    <Text style={[styles.navLabel, selected && styles.navLabelActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Commencer le rituel du soir"
                onPress={startRitual}
                style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}
              >
                <Sprout size={20} color={colors.ink} strokeWidth={1.9} />
                <Text style={styles.navLabel}>Le rituel</Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ouvrir les préférences"
              accessibilityState={{ selected: route === 'settings' }}
              onPress={() => router.replace('/settings')}
              style={({ pressed }) => [
                styles.navItem,
                route === 'settings' && styles.navItemActive,
                pressed && styles.pressed,
              ]}
            >
              <Settings size={20} color={colors.ink} strokeWidth={1.9} />
              <Text style={[styles.navLabel, route === 'settings' && styles.navLabelActive]}>
                Préférences
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.main}
            contentContainerStyle={styles.mainContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </SafeAreaView>
    </ShellContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 224,
    paddingVertical: 28,
    paddingHorizontal: 18,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  logo: {
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 32,
    color: colors.ink,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  childSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  childName: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.6,
  },
  nav: {
    flex: 1,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  navItemActive: {
    backgroundColor: colors.peach,
  },
  navLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.inkSoft,
  },
  navLabelActive: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
  main: {
    flex: 1,
  },
  mainContent: {
    padding: 40,
    maxWidth: 720,
    width: '100%',
  },
});
