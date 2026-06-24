# 실연동 키 / 환경변수 가이드

키·시크릿은 **`.env`(gitignored)** 에 넣습니다. `.env.example`을 복사해 채우세요.
**절대 실제 키를 코드/커밋에 넣지 마세요.** (`.env`는 `.gitignore`에 포함)

```bash
cp .env.example .env   # 그리고 값 채우기
```

| 환경변수 | 쓰임 | 어디서 읽나 |
|---|---|---|
| `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` | Spotify Client ID | `src/services/config.ts` |
| `EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET` | Spotify Client Secret | `src/services/config.ts` |
| `GOOGLE_MAPS_API_KEY` | Google Maps SDK 키 | `app.config.js` (react-native-maps 플러그인) |
| `EXPO_PUBLIC_API_BASE_URL` *(선택)* | 백엔드 URL | `app.config.js` → `extra.apiBaseUrl` |

> `EXPO_PUBLIC_*`는 Metro가 JS 번들에 인라인 → dev에서 **Metro 재시작**으로 반영(네이티브 재빌드 불필요). `GOOGLE_MAPS_API_KEY`는 `app.config.js`가 prebuild 때 읽으므로 키 변경 시 `expo prebuild --clean` 필요.

---

## M2 — Google Maps (실지도) ✅

- `GOOGLE_MAPS_API_KEY`를 `.env`에 넣으면 `app.config.js`가 react-native-maps 플러그인(`iosGoogleMapsApiKey`/`androidGoogleMapsApiKey`)에 주입 → Info.plist·AppDelegate·Podfile 자동 설정.
- 다크 스타일 지도 + 커스텀 드랍 마커 + 내 위치 + 그라데이션 오라/반경 링 + Drop 미니맵.
- ⚠️ **키 제한 필수**: Google Cloud Console에서 **iOS 번들 ID `com.remedy.app` / Android 패키지 `com.remedy.app`** + Maps SDK API로 제한하세요.

## M3 — Spotify 검색 (로그인 불필요) ✅

- **Client Credentials**(앱 토큰)로 로그인 없이 Spotify Search API(앨범아트 포함) 검색.
- `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` + `EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET`를 `.env`에.
- ⚠️ 백엔드가 없으면 Secret이 **앱 번들에 인라인**됩니다(레포엔 없음). 공개 배포 전 **백엔드 프록시로 Secret 분리** 권장. 노출된 적 있으면 **대시보드에서 Secret 재발급(rotate)** 필수.
- 로그인(OAuth)은 검색에 불필요 → LoginScreen 버튼은 mock 진입. OAuth/재생은 M3.5.

## M3.5 — Spotify 실재생 (App Remote = 폰의 Spotify 앱 제어) ⏳

- **Premium 계정** + **실기기** + 폰에 **Spotify 앱 설치·로그인** 필요(시뮬레이터 불가).
- `react-native-spotify-remote` 설치 + iOS `LSApplicationQueriesSchemes`에 `spotify` 추가 + dev 빌드 재생성. 플레이어 UI는 `PlaybackController`(`src/services/spotify.ts`)에 바인딩.

## M4 — 백엔드 (드랍 CRUD / 댓글 / 좋아요 / 프로필) 🟡

- 지금은 in-memory mock(`src/services/drops.ts` `USE_MOCK=true`)으로 동작.
- API 준비되면 `EXPO_PUBLIC_API_BASE_URL` 설정 + `USE_MOCK=false`. 엔드포인트 계약은 `design_handoff_remedy/DATA_MODEL.md` §2.

---

## 키/설정 변경 후 재빌드

- JS·`EXPO_PUBLIC_*`만 바뀐 경우: **Metro 재시작**(`.env` 재로딩).
- `GOOGLE_MAPS_API_KEY`/`app.config.js`/네이티브 모듈이 바뀐 경우:
  ```bash
  npx expo prebuild --clean
  npx expo run:ios
  ```
