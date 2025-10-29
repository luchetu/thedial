import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, PhoneOff, Mic } from "lucide-react";
import { CallActivityChart } from "@/components/dashboard/Charts/CallActivityChart";

export default function CallsPage() {
  return (
    <div className="space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Calls</h2>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            All Calls
          </TabsTrigger>
          <TabsTrigger value="missed" className="flex items-center gap-2">
            <PhoneOff className="h-4 w-4" />
            Missed Calls
          </TabsTrigger>
          <TabsTrigger value="recordings" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Recordings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Activity</CardTitle>
              <CardDescription>Weekly call activity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <CallActivityChart />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>All Calls</CardTitle>
              <CardDescription>Complete call history and management</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">All calls interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="missed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Missed Calls</CardTitle>
              <CardDescription>Calls you missed and need to return</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Missed calls interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recordings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recordings</CardTitle>
              <CardDescription>Access and manage your call recordings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Recordings interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}