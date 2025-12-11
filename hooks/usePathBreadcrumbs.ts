"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

export interface BreadcrumbItem {
    label: string;
    href: string;
}

// Label overrides for specific path segments
const LABEL_OVERRIDES: Record<string, string> = {
    dashboard: "Dashboard",
    "ai-assistant": "AI Assistant",
    "caller-id": "Caller ID",
    "dial-numbers": "Dial Numbers",
    "phone-numbers": "Phone Numbers",
    "credential-lists": "Credential Lists",
    "dispatch-rules": "Dispatch Rules",
    "plan-routing-profiles": "Plan Routing Profiles",
    "routing-profiles": "Routing Profiles",
    admin: "Admin",
};

function toTitleCase(str: string): string {
    return str
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Hook that generates breadcrumb items from the current URL path.
 * 
 * @example
 * // For path /dashboard/settings/phone/caller-id
 * // Returns: [
 * //   { label: "Home", href: "/dashboard" },
 * //   { label: "Settings", href: "/dashboard/settings" },
 * //   { label: "Phone", href: "/dashboard/settings/phone" },
 * //   { label: "Caller ID", href: "/dashboard/settings/phone/caller-id" }
 * // ]
 */
export function usePathBreadcrumbs(): BreadcrumbItem[] {
    const pathname = usePathname();

    return useMemo(() => {
        if (!pathname) return [];

        const segments = pathname.split("/").filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [];

        let currentPath = "";
        for (const segment of segments) {
            currentPath += `/${segment}`;
            const label = LABEL_OVERRIDES[segment] ?? toTitleCase(segment);
            breadcrumbs.push({ label, href: currentPath });
        }

        return breadcrumbs;
    }, [pathname]);
}
