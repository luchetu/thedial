import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col h-full">
            {/* Breadcrumb Header Bar - Static, no skeleton needed */}
            <header className="flex h-12 shrink-0 items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <PageBreadcrumb />
            </header>

            {/* Page Title Section */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-9 w-40" />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4 lg:px-6">
                            {/* Stats Grid */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Card key={i}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-8 w-16 mb-1" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Derived metrics */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-2">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <Card key={i}>
                                        <CardHeader className="pb-2">
                                            <Skeleton className="h-4 w-32 mb-1" />
                                            <Skeleton className="h-3 w-48" />
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-8 w-20" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8 mb-8">
                                {/* Call Activity Graph */}
                                <Card className="col-span-4">
                                    <CardHeader>
                                        <Skeleton className="h-6 w-32 mb-1" />
                                        <Skeleton className="h-4 w-64" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-[200px] w-full rounded-lg" />
                                    </CardContent>
                                </Card>

                                {/* Call outcomes breakdown */}
                                <Card className="col-span-3">
                                    <CardHeader>
                                        <Skeleton className="h-6 w-32 mb-1" />
                                        <Skeleton className="h-4 w-48" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-40 w-40 rounded-full" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-full" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Connected Number Card */}
                                <Card className="col-span-7">
                                    <CardHeader>
                                        <Skeleton className="h-6 w-48 mb-1" />
                                        <Skeleton className="h-4 w-64" />
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Skeleton className="h-20 w-full rounded-lg" />
                                        <div className="flex gap-2">
                                            <Skeleton className="h-9 w-full" />
                                            <Skeleton className="h-9 w-full" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
