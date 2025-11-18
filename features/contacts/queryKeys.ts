export const contactsKeys = {
  all: ["contacts"] as const,
  list: (params?: { search?: string; sort?: string }) =>
    ["contacts", "list", params ?? {}] as const,
  detail: (id: string) => ["contacts", "detail", id] as const,
  default: ["contacts", "default"] as const,
};

