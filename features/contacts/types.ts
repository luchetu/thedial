export type Contact = {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  is_default: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateContactRequest = {
  name: string;
  phone_number: string;
  is_default?: boolean;
};

export type UpdateContactRequest = {
  name?: string;
  phone_number?: string;
  is_default?: boolean;
};

