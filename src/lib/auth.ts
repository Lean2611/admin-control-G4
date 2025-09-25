"use client";

export type AuthState = {
  token: string;
  roles: string[];   // ["ADMIN","DRIVER",...]
  user?: any;
};

const KEY = "auth";

export function saveAuth(data: AuthState) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function hasAdminRole(state: AuthState | null) {
  return !!state?.roles?.includes("ADMIN");
}

// Decodifica payload de un JWT si viene como "Bearer x.y.z" o "x.y.z"
export function decodeJwtRolesFromToken(token?: string): string[] {
  if (!token) return [];
  const raw = token.startsWith("Bearer ") ? token.slice(7) : token;
  const parts = raw.split(".");
  if (parts.length !== 3) return [];
  try {
    const payload = JSON.parse(atob(parts[1]));
    // backend arma el payload con { id, name, roles: [...] }
    return Array.isArray(payload?.roles) ? payload.roles : [];
  } catch {
    return [];
  }
}