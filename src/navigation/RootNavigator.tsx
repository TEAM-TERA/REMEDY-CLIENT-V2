/**
 * Root native-stack. Replaces the prototype's manual screen/history stack.
 * Initial route depends on the restored session (authenticated → Map, else
 * Login). Headers are hidden (each screen draws its own).
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { colors } from '@/theme/tokens';

import LoginScreen from '@/screens/LoginScreen';
import AuthScreen from '@/screens/AuthScreen';
import MapScreen from '@/screens/MapScreen';
import PlayerScreen from '@/screens/PlayerScreen';
import DropSearchScreen from '@/screens/DropSearchScreen';
import DropScreen from '@/screens/DropScreen';
import VoteDropScreen from '@/screens/VoteDropScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import ProfileEditScreen from '@/screens/ProfileEditScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import PlaylistScreen from '@/screens/PlaylistScreen';
import AddSongsScreen from '@/screens/AddSongsScreen';
import SettingsScreen from '@/screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator({ authenticated }: { authenticated: boolean }) {
  return (
    <Stack.Navigator
      initialRouteName={authenticated ? 'Map' : 'Login'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgBase },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Auth" component={AuthScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Map" component={MapScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen
        name="DropSearch"
        component={DropSearchScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Drop" component={DropScreen} />
      <Stack.Screen name="VoteDrop" component={VoteDropScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Playlist" component={PlaylistScreen} />
      <Stack.Screen name="AddSongs" component={AddSongsScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
