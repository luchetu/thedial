"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../api";
import { usersKeys } from "../queryKeys";
import type { CreateUserInput, User } from "../types";

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation<User, unknown, CreateUserInput>({
    mutationFn: (input) => createUser(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}


