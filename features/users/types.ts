export type User = {
  id: string;
  fullName: string;
  email: string;
  authProvider: string;
  emailVerified: boolean;
  isActive: boolean;
  role?: string;
  recordingConsent: boolean;
  termsAcceptedAt?: string | null;
  plan?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserListResponse = {
  items: User[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
};

export type CreateUserInput = {
  fullName: string;
  email: string;
  password?: string;
  authProvider: "email" | "google";
  recordingConsent: boolean;
};


