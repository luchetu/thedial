import { http } from "@/lib/http/client";

import type { User, UserListResponse, CreateUserInput } from "./types";

export function getUser(id: string) {
  return http<User>(`/users/${id}`);
}

export function listUsers(params?: { page?: number; pageSize?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return http<UserListResponse>(`/users${suffix}`);
}

export function createUser(input: CreateUserInput) {
  return http<User>(`/users`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}


