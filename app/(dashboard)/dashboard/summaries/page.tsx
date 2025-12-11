import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Tag, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

export default function SummariesPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex h-12 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <PageBreadcrumb />
        <h2 className="text-xl font-semibold tracking-tight">AI Summaries</h2>
      </header>
      <div className="space-y-4 p-4 md:p-8 pt-6">

        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Summaries</CardTitle>
                <CardDescription>Latest AI-generated call summaries</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Recent summaries interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tagged Summaries</CardTitle>
                <CardDescription>Organize summaries with custom tags</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Tags interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search Summaries</CardTitle>
                <CardDescription>Find specific summaries using AI-powered search</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Search interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}