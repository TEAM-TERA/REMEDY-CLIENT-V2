import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Single native-stack. Screen keys map to the prototype's `screen` values:
 * login, main(Map), player, dropSearch(DropSearch), drop(Drop), profile,
 * playlist, settings. (README §4)
 */
export type RootStackParamList = {
  Login: undefined;
  Map: undefined;
  Player: undefined;
  DropSearch: undefined;
  Drop: undefined;
  Profile: undefined;
  Playlist: undefined;
  AddSongs: { playlistId: string };
  Settings: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
