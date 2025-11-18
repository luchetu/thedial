import { http } from "@/lib/http/client";

import type {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
} from "./types";

export function getContacts(params?: {
  search?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.sort) q.set("sort", params.sort);
  if (params?.limit !== undefined) q.set("limit", String(params.limit));
  if (params?.offset !== undefined) q.set("offset", String(params.offset));
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return http<Contact[]>(`/contacts${suffix}`);
}

export function getContact(id: string) {
  return http<Contact>(`/contacts/${id}`);
}

export function createContact(data: CreateContactRequest) {
  return http<Contact>(`/contacts`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateContact(id: string, data: UpdateContactRequest) {
  return http<Contact>(`/contacts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteContact(id: string) {
  return http<void>(`/contacts/${id}`, {
    method: "DELETE",
  });
}

export function setDefaultContact(id: string) {
  return http<Contact>(`/contacts/${id}/set-default`, {
    method: "PATCH",
  });
}

export function batchCreateContacts(contacts: CreateContactRequest[]) {
  return http<Contact[]>(`/contacts/batch`, {
    method: "POST",
    body: JSON.stringify({ contacts }),
  });
}

