"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// Simplified list of common country codes
// In a real app, this should probably come from a library like `libphonenumber-js`
export const countries = [
    { value: "US", label: "United States", code: "+1", flag: "🇺🇸" },
    { value: "GB", label: "United Kingdom", code: "+44", flag: "🇬🇧" },
    { value: "CA", label: "Canada", code: "+1", flag: "🇨🇦" },
    { value: "AU", label: "Australia", code: "+61", flag: "🇦🇺" },
    { value: "DE", label: "Germany", code: "+49", flag: "🇩🇪" },
    { value: "FR", label: "France", code: "+33", flag: "🇫🇷" },
    { value: "IN", label: "India", code: "+91", flag: "🇮🇳" },
    { value: "JP", label: "Japan", code: "+81", flag: "🇯🇵" },
    { value: "BR", label: "Brazil", code: "+55", flag: "🇧🇷" },
    { value: "MX", label: "Mexico", code: "+52", flag: "🇲🇽" },
    // Add more as needed
];

interface CountrySelectProps {
    value: string; // The selected country dial code (e.g., "+1")
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function CountrySelect({ value, onChange, disabled }: CountrySelectProps) {
    const [open, setOpen] = React.useState(false);

    const selectedCountry = countries.find((country) => country.code === value) || countries[0];

    return (
        <Popover open={open && !disabled} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[100px] justify-between px-3"
                    disabled={disabled}
                >
                    <span className="mr-1">{selectedCountry.flag}</span>
                    {selectedCountry.code}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                            {countries.map((country) => (
                                <CommandItem
                                    key={country.value}
                                    value={country.label + " " + country.code}
                                    onSelect={() => {
                                        onChange(country.code);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === country.code ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="mr-2 text-lg">{country.flag}</span>
                                    <span className="flex-1 truncate">{country.label}</span>
                                    <span className="ml-auto text-muted-foreground tabular-nums">
                                        {country.code}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
