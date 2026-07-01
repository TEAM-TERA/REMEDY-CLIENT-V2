import 'react-native-gesture-handler';
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, type Theme } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RootNavigator } from '@/navigation/RootNavigator';
import { useAppFonts } from '@/theme/useAppFonts';
import { useAuthStore } from '@/store/useAuthStore';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bgBase,
    card: colors.bgBase,
    primary: colors.pink,
    text: colors.textPrimary,
    border: 'transparent',
  },
};

export default function App() {
  const fontsLoaded = useAppFonts();
  const restoring = useAuthStore((s) => s.restoring);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  // restore a persisted JWT session (token → GET /users) before first render
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const ready = fontsLoaded && !restoring;

  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1, backgroundColor: colors.bgBase }}>
            <NavigationContainer theme={navTheme}>
              <StatusBar style="light" />
              <RootNavigator authenticated={isAuthenticated} />
            </NavigationContainer>
          </View>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
