"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal, Phone, Edit, Trash2, Star, Mail } from "lucide-react";
import { useContactsInfinite } from "@/features/contacts/hooks/useContactsInfinite";
import type { Contact } from "@/features/contacts/types";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToggleFavoriteContact } from "@/features/contacts/hooks/useToggleFavoriteContact";

interface ContactListProps {
  onCall?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  className?: string;
}

export const ContactList = ({
  onCall,
  onEdit,
  onDelete,
  className,
}: ContactListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const toggleFavorite = useToggleFavoriteContact();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useContactsInfinite({
    search: searchQuery || undefined,
    sort: "name",
  });

  const contacts = data?.pages.flat() || [];

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const contact = row.original;
        const initials = (contact.name || "")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "??";

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 bg-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium flex items-center gap-1.5">
                {contact.name}
                {contact.is_favorite && (
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                )}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.phone_number;
        if (!phone) return <span className="text-muted-foreground">-</span>;

        // Format +1 (415) 555-1234
        let formatted = phone;
        if (phone.startsWith("+1") && phone.length === 12) {
          const area = phone.slice(2, 5);
          const prefix = phone.slice(5, 8);
          const number = phone.slice(8);
          formatted = `+1 (${area}) ${prefix}-${number}`;
        }

        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>{formatted}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-zinc-200/50 shadow-xl">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {onCall && (
                  <DropdownMenuItem onClick={() => onCall(contact)}>
                    <Phone className="mr-2 h-4 w-4" /> Call
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(contact)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => toggleFavorite.mutate(contact.id)}>
                  <Star className={cn("mr-2 h-4 w-4", contact.is_favorite ? "fill-yellow-400 text-yellow-400" : "")} />
                  {contact.is_favorite ? "Unfavorite" : "Favorite"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(contact)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <Card className={cn("flex flex-col h-full border-0 shadow-none", className)}>
      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        <div className="p-6 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-10 bg-muted/50 border-input/50 focus:bg-background transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <DataTable
            columns={columns}
            data={contacts}
          />
          {/* Infinite scroll trigger / layout shim if needed */}
          <div className="h-4" />
        </div>
      </CardContent>
    </Card>
  );
};

