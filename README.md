# RE:MEDY

위치 기반 음악 소셜 앱 — "거리에 음악을 흘려두고, 누군가의 하루에 닿게."
React Native (Expo SDK 56 · TypeScript) 구현. 디자인 핸드오프(`design_handoff_remedy/`)를 픽셀에 가깝게 재현했습니다.

## 빠른 실행

```bash
npm install
npx expo run:ios        # 네이티브 dev 빌드 (시뮬레이터/기기) — Expo Go로는 일부 모듈 불가
# 또는 이미 빌드돼 있으면
npm run ios
```

> Reanimated 4 / New Architecture / 커스텀 폰트(Pretendard·Gowun Batang) 때문에 **dev 빌드**를 사용합니다.
> 타입 검사: `npm run typecheck`

## 화면 (8)

`Login · Map · Player · DropSearch · Drop · Profile · Playlist · Settings`
네비게이션은 React Navigation native-stack (`src/navigation`). 전역 상태는 Zustand (`src/store`).

## 구조

```
src/
  theme/        토큰(색·타이포·간격·그림자), 커버 팔레트, 폰트 로더
  types/        데이터 계약 (User/Song/Drop/Comment/Playlist) — DATA_MODEL.md 기반
  data/         mock 시드 (프로토타입과 1:1)
  store/        Zustand (앱 UI 상태 / 인증 세션)
  components/   Avatar, SongCover, GlassView, Gradient, Icons, map/, anim/
  navigation/   RootNavigator, 타입
  screens/      8개 화면
  services/     spotify · drops · location · maps · config (실연동 레이어)
assets/fonts/   Pretendard(.otf) — Gowun Batang은 @expo-google-fonts
```

## 디자인 충실도 메모

- 색/타이포/간격/그림자/모서리는 `design_handoff_remedy/README.md §3` 토큰을 그대로 사용.
- 곡 커버·앱 배경·로그인 글로우의 **radial-gradient**는 RN에 없어 `react-native-svg`로 재현.
- 글래스(blur)는 `expo-blur`, 애니메이션(rmPulse/rmSpin/rmRing/rmDrift/rmFade)은 `react-native-reanimated`.
- 다층 그림자/spread는 RN 0.85의 `boxShadow` 스타일로 1:1 이식.
- 지도 디스크의 conic 테두리는 linear-gradient 근사(네이티브 conic 미지원).

## 마일스톤

| | 내용 | 상태 |
|---|---|---|
| **M1** | 토큰·컴포넌트·8화면·네비게이션·애니메이션 (mock) | ✅ 완료 |
| **M2** | Google Maps 실지도 (다크 스타일·커스텀 드랍 마커·내 위치·2모드·미니맵) | ✅ 완료 |
| **M3** | 드랍 음악 **실 Spotify 검색** (Client Credentials, 로그인 불필요·앨범아트) | ✅ 완료 |
| **M3.5** | Spotify App Remote 실재생 (폰 Spotify 앱 제어) | ⏳ Premium·실기기·`react-native-spotify-remote` |
| **M4** | 백엔드 드랍 CRUD·댓글·좋아요 | 🟡 더미데이터로 동작 (`USE_MOCK=true`) |

> 드랍은 인메모리 스토어(`useAppStore.drops`, 시드=mock)에 영속 — **드랍하면 지도에 핀으로 즉시 추가**됩니다(세션 한정). M4 백엔드 연결 시 실데이터로 대체.

> **M2 노트**: 지도는 `react-native-maps`(Google provider) + `app.json`의 `react-native-maps` 플러그인 `iosGoogleMapsApiKey`/`androidGoogleMapsApiKey`로 설정. 드랍 마커 커버는 Google Maps iOS 마커 안에서 SVG가 안정적으로 래스터화되지 않아 `expo-linear-gradient`로 근사([PinVisual](src/components/map/PinVisual.tsx)). mock 드랍은 내 위치 주변(디자인 mapX/mapY 상대좌표)에 배치 — M4에서 `getNearbyDrops()` 실좌표로 대체.

실연동에 필요한 키/계정은 **`INTEGRATION_KEYS.md`** 참고. 서비스 레이어(`src/services`)는 키만 꽂으면 동작하도록 미리 작성돼 있습니다.
