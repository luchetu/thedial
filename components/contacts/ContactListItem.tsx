"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Edit, Trash2 } from "lucide-react";
import type { Contact } from "@/features/contacts/types";

interface ContactListItemProps {
  contact: Contact;
  onCall?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

export const ContactListItem = ({
  contact,
  onCall,
  onEdit,
  onDelete,
}: ContactListItemProps) => {
  const initials = (contact.name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  const formatPhoneNumber = (phone: string | undefined | null) => {
    // Handle undefined/null phone numbers
    if (!phone) return "";
    // Format E.164 number for display (e.g., +14155551234 -> +1 (415) 555-1234)
    if (phone.startsWith("+1") && phone.length === 12) {
      const area = phone.slice(2, 5);
      const prefix = phone.slice(5, 8);
      const number = phone.slice(8);
      return `+1 (${area}) ${prefix}-${number}`;
    }
    return phone;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{contact.name}</h3>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3 shrink-0" />
                  <span className="truncate">{formatPhoneNumber(contact.phone_number)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onCall && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onCall(contact)}
                className="flex items-center gap-1 bg-black text-white hover:bg-black/90"
              >
                <Phone className="h-4 w-4" />
                Call
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(contact)}
                aria-label="Edit contact"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onDelete(contact)}
                aria-label="Delete contact"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

