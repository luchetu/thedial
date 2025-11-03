"use client";

import { useMutation } from "@tanstack/react-query";
import { login } from "../api";
import type { LoginInput, LoginResponse } from "../types";

export function useLogin() {
  return useMutation<LoginResponse, unknown, LoginInput>({
    mutationFn: (input) => login(input),
  });
}


