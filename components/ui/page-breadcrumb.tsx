"use client";

import Link from "next/link";
import { usePathBreadcrumbs } from "@/hooks/usePathBreadcrumbs";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

interface PageBreadcrumbProps {
    /** Optional className for the nav element */
    className?: string;
}

/**
 * A reusable breadcrumb component that auto-generates navigation
 * based on the current URL path.
 */
export function PageBreadcrumb({ className }: PageBreadcrumbProps) {
    const breadcrumbs = usePathBreadcrumbs();

    if (breadcrumbs.length <= 1) {
        return null; // Don't show breadcrumbs for root pages
    }

    return (
        <Breadcrumb className={className}>
            <BreadcrumbList>
                {breadcrumbs.slice(0, -1).map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 2;

                    return (
                        <Fragment key={crumb.href}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={crumb.href}>{crumb.label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
