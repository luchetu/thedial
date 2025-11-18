import { http } from "@/lib/http/client";
import type { LoginInput, LoginResponse, CurrentUser } from "./types";

export function login(input: LoginInput) {
  return http<LoginResponse>(`/auth/login`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return http<void>(`/auth/logout`, { method: "POST" });
}

export function getCurrentUser() {
  return http<CurrentUser>(`/users/me`);
}

export function updateCurrentUser(data: { fullName?: string }) {
  return http<CurrentUser>(`/users/me`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}


