import type { User } from "@/features/users/types";

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token?: string;
  user?: User;
};

export type CurrentUser = User | null;


