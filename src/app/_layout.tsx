import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import {
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
  useFonts,
} from '@expo-google-fonts/quicksand';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ServicesProvider } from '@/di/services-provider';
import { ActiveChildProvider } from '@/ui/state/active-child-context';
import { RitualDraftProvider } from '@/ui/state/ritual-draft-context';
import { SessionProvider } from '@/ui/state/session-context';
import { colors } from '@/ui/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    Caveat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ServicesProvider>
      <SessionProvider>
        <ActiveChildProvider>
          <RitualDraftProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            />
          </RitualDraftProvider>
        </ActiveChildProvider>
      </SessionProvider>
    </ServicesProvider>
  );
}
