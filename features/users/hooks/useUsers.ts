"use client";

import { useQuery } from "@tanstack/react-query";
import { listUsers } from "../api";
import { usersKeys } from "../queryKeys";
import type { UserListResponse } from "../types";

export function useUsers(params?: { page?: number; pageSize?: number }) {
  return useQuery<UserListResponse>({
    queryKey: usersKeys.list(params),
    queryFn: () => listUsers(params),
    keepPreviousData: true,
  });
}


