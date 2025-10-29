import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactsSecondaryMenu } from "@/components/contacts-secondary-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, MoreHorizontal } from "lucide-react";

// Sample contact groups data
const groupsData = [
  {
    id: "1",
    name: "Priority Clients",
    description: "High-priority clients requiring immediate attention",
    contactCount: 12,
    color: "bg-red-100 text-red-800"
  },
  {
    id: "2",
    name: "Follow-up Required",
    description: "Contacts that need follow-up calls or actions",
    contactCount: 8,
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    id: "3",
    name: "Technical Contacts",
    description: "Technical leads and engineering contacts",
    contactCount: 15,
    color: "bg-blue-100 text-blue-800"
  },
  {
    id: "4",
    name: "Partners",
    description: "Business partners and strategic relationships",
    contactCount: 6,
    color: "bg-green-100 text-green-800"
  }
]

export default function ContactGroupsPage() {
  return (
    <div className="flex h-screen">
      {/* Secondary Menu */}
      <div className="w-64 shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-2">Contacts</h1>
        </div>
        <Separator className="mb-2" />
        <div className="flex-1 px-6 pb-6">
          <ContactsSecondaryMenu />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
        </header>
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Contact Groups</h2>
                  <p className="text-muted-foreground">Organize your contacts into groups for better management</p>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Group
                </Button>
              </div>
              
              {/* Groups Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupsData.map((group) => (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>{group.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {group.contactCount} contacts
                          </span>
                        </div>
                        <Badge className={group.color}>
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common group management tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      Bulk Add Contacts
                    </Button>
                    <Button variant="outline" size="sm">
                      Export Groups
                    </Button>
                    <Button variant="outline" size="sm">
                      Import Groups
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
