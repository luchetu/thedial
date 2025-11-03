export const usersKeys = {
  all: ["users"] as const,
  list: (params?: { page?: number; pageSize?: number }) =>
    ["users", "list", params ?? {}] as const,
  detail: (id: string) => ["users", "detail", id] as const,
};


