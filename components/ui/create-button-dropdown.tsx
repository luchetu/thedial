"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";

interface CreateButtonWithDropdownProps {
  options: Array<{
    label: string;
    onClick: () => void;
  }>;
  buttonText?: string;
}

export function CreateButtonWithDropdown({
  options,
  buttonText = "Create new",
}: CreateButtonWithDropdownProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className="flex items-center gap-2 text-white"
        >
          <Plus className="h-4 w-4" />
          {buttonText}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={option.onClick}
            className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-sm"
          >
            {option.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

