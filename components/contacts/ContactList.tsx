"use client";

import { useState, useEffect, useRef } from "react";
import { ContactListItem } from "./ContactListItem";
import { Input } from "@/components/ui/input";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { useContactsInfinite } from "@/features/contacts/hooks/useContactsInfinite";
import type { Contact } from "@/features/contacts/types";
import { Card, CardContent } from "@/components/ui/card";

interface ContactListProps {
  onCall?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

export const ContactList = ({
  onCall,
  onEdit,
  onDelete,
}: ContactListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useContactsInfinite({
    search: searchQuery || undefined,
    sort: "name",
  });

  // Flatten all pages into a single array
  const contacts = data?.pages.flat() || [];

  // Sort by name (backend already sorts, but we can re-sort client-side if needed)
  const sortedContacts = [...contacts].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load contacts. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Contacts List */}
      {sortedContacts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No contacts found matching your search."
                : "No contacts yet. Add your first contact to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {sortedContacts.map((contact) => (
              <ContactListItem
                key={contact.id}
                contact={contact}
                onCall={onCall}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
          
          {/* Load more trigger */}
          <div ref={loadMoreRef} className="py-4">
            {isFetchingNextPage && (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading more contacts...
                </span>
              </div>
            )}
            {!hasNextPage && sortedContacts.length > 0 && (
              <div className="text-center text-sm text-muted-foreground py-2">
                No more contacts to load
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

