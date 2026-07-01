// Expo dynamic config. Secrets/keys are read from the environment (.env, which
// is gitignored) — never hardcode them here. See .env.example.
// Expo CLI auto-loads .env into process.env for start / prebuild / run.
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? '';

export default () => ({
  name: 'RE:MEDY',
  slug: 'remedy',
  scheme: 'remedy',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#100e1a',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0c0a14',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.remedy.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        '주변에 떨어진 음악(드랍)을 지도에서 보여주고, 내 위치에 음악을 드랍하기 위해 위치 정보를 사용합니다.',
      UIBackgroundModes: ['audio'],
    },
  },
  android: {
    package: 'com.remedy.app',
    edgeToEdgeEnabled: true,
    adaptiveIcon: {
      backgroundColor: '#100e1a',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'react-native-maps',
      {
        iosGoogleMapsApiKey: GOOGLE_MAPS_API_KEY,
        androidGoogleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          '주변 드랍을 지도에서 보여주고, 내 위치에 음악을 드랍하기 위해 위치 정보를 사용합니다.',
      },
    ],
    'expo-secure-store',
    'expo-web-browser',
    'expo-audio',
    'expo-splash-screen',
  ],
  extra: {
    // Backend base URL is resolved in-app (src/services/config.ts) with a
    // per-platform default; EXPO_PUBLIC_API_BASE_URL overrides it. Spotify
    // search/metadata is served by the backend — no Spotify secret in the app.
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  },
});
