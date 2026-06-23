/**
 * Root native-stack. Replaces the prototype's manual screen/history stack.
 * Login is initial; on sign-in screens reset to Map so back doesn't return to
 * login. Headers are hidden (each screen draws its own).
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { colors } from '@/theme/tokens';

import LoginScreen from '@/screens/LoginScreen';
import MapScreen from '@/screens/MapScreen';
import PlayerScreen from '@/screens/PlayerScreen';
import DropSearchScreen from '@/screens/DropSearchScreen';
import DropScreen from '@/screens/DropScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import PlaylistScreen from '@/screens/PlaylistScreen';
import AddSongsScreen from '@/screens/AddSongsScreen';
import SettingsScreen from '@/screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgBase },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Map" component={MapScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen
        name="DropSearch"
        component={DropSearchScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Drop" component={DropScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Playlist" component={PlaylistScreen} />
      <Stack.Screen name="AddSongs" component={AddSongsScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
