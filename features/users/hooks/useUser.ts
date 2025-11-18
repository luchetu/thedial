"use client";

import { useQuery } from "@tanstack/react-query";
import { getUser } from "../api";
import { usersKeys } from "../queryKeys";
import type { User } from "../types";

export function useUser(id: string) {
  return useQuery<User>({
    queryKey: usersKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: Boolean(id),
  });
}


