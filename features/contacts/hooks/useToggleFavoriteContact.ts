"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFavoriteContact } from "../api";
import { contactsKeys } from "../queryKeys";

export function useToggleFavoriteContact() {
    const queryClient = useQueryClient();

    return useMutation<{ is_favorite: boolean }, unknown, string>({
        mutationFn: (id) => toggleFavoriteContact(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contactsKeys.all });
        },
    });
}
