/**
 * Loads Pretendard (bundled .otf) + Gowun Batang (@expo-google-fonts) at
 * runtime. Family names match src/theme/tokens `font`.
 */
import { useFonts } from 'expo-font';
import { GowunBatang_400Regular, GowunBatang_700Bold } from '@expo-google-fonts/gowun-batang';

export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.otf'),
    'Pretendard-ExtraBold': require('../../assets/fonts/Pretendard-ExtraBold.otf'),
    GowunBatang_400Regular,
    GowunBatang_700Bold,
  });
  return loaded;
}
