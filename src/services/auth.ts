/**
 * Auth against REMEDY-BACK-V3: local email register/login + OAuth2.
 *  - register → 201 void
 *  - login → { accessToken }; the JWT is persisted via api.setToken.
 *  - oauth2 (google/kakao/naver) needs provider client creds configured on the
 *    backend (unset in local dev) — wired here for completeness.
 */
import { apiPost, setToken } from '@/services/api';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  birthDate: string; // YYYY-MM-DD
  gender: boolean; // false = 여성/미지정, true = 남성 (backend boolean)
}

export async function register(input: RegisterInput): Promise<void> {
  await apiPost('/auth/register', input, false);
}

/** Logs in, persists the JWT, returns the token. */
export async function login(email: string, password: string): Promise<string> {
  const res = await apiPost<{ accessToken: string }>('/auth/login', { email, password }, false);
  await setToken(res.accessToken);
  return res.accessToken;
}

export async function logout(): Promise<void> {
  await setToken(null);
}

export type OAuthProvider = 'google' | 'kakao' | 'naver';

/** Exchange a provider auth code for a session. Backend needs provider creds. */
export async function oauthLogin(provider: OAuthProvider, code: string, redirectUri: string): Promise<string> {
  const res = await apiPost<{ accessToken: string }>(`/oauth2/${provider}`, { code, redirectUri }, false);
  await setToken(res.accessToken);
  return res.accessToken;
}
