import type { AppRole } from "./rbac";

export type AuthUser = {
  id: string;
  fullName: string;
  role: AppRole;
  clinicIds: string[];
};

const ACCESS_TOKEN_KEY = "shc.accessToken";
const USER_KEY = "shc.user";

export const authStore = {
  getToken(): string | null {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setSession(token: string, user: AuthUser): void {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser(): AuthUser | null {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  clear(): void {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
};
