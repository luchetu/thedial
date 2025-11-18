"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../api";
import { useRouter } from "next/navigation";

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation<void, unknown, void>({
    mutationFn: () => logout(),
    onSuccess: async () => {
      await qc.invalidateQueries();
      router.replace("/auth/login");
    },
  });
}


