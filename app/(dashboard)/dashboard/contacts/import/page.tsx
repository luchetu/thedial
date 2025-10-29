import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactsSecondaryMenu } from "@/components/contacts-secondary-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Link, FileText, CheckCircle, AlertCircle } from "lucide-react";

// Sample import sources
const importSources = [
  {
    id: "1",
    name: "Google Contacts",
    description: "Import contacts from your Google account",
    icon: "🔗",
    status: "connected",
    lastSync: "2024-01-15 10:30"
  },
  {
    id: "2",
    name: "Outlook",
    description: "Sync contacts from Microsoft Outlook",
    icon: "📧",
    status: "not_connected",
    lastSync: null
  },
  {
    id: "3",
    name: "CSV File",
    description: "Upload contacts from a CSV file",
    icon: "📄",
    status: "available",
    lastSync: null
  },
  {
    id: "4",
    name: "Salesforce",
    description: "Import contacts from Salesforce CRM",
    icon: "☁️",
    status: "not_connected",
    lastSync: null
  }
]

const statusConfig = {
  connected: { label: "Connected", color: "bg-green-100 text-green-800", icon: CheckCircle },
  not_connected: { label: "Not Connected", color: "bg-gray-100 text-gray-800", icon: AlertCircle },
  available: { label: "Available", color: "bg-blue-100 text-blue-800", icon: FileText }
}

export default function ContactsImportPage() {
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
              <div>
                <h2 className="text-xl font-semibold mb-2">Import / Sync</h2>
                <p className="text-muted-foreground">Import contacts from other sources or sync with external services</p>
              </div>
              
              {/* Import Sources */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Import Sources</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {importSources.map((source) => {
                    const statusInfo = statusConfig[source.status]
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <Card key={source.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{source.icon}</div>
                              <div>
                                <h4 className="font-medium">{source.name}</h4>
                                <p className="text-sm text-muted-foreground">{source.description}</p>
                                {source.lastSync && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Last sync: {source.lastSync}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={statusInfo.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                              <Button variant="outline" size="sm">
                                {source.status === "connected" ? "Sync" : "Connect"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload CSV File
                  </CardTitle>
                  <CardDescription>
                    Import contacts from a CSV file. Make sure your file includes columns for name, email, and phone.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Drag and drop your CSV file here, or click to browse
                    </p>
                    <Button variant="outline">
                      Choose File
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Required columns: name, email, phone</li>
                      <li>• Optional columns: company, tags, notes</li>
                      <li>• Maximum file size: 10MB</li>
                      <li>• Supported formats: .csv, .xlsx</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Imports */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Imports</CardTitle>
                  <CardDescription>Your recent contact import activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Google Contacts Import</p>
                          <p className="text-sm text-muted-foreground">45 contacts imported</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">2024-01-15 10:30</p>
                        <Badge variant="outline" className="text-xs">Completed</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">CSV Upload</p>
                          <p className="text-sm text-muted-foreground">12 contacts imported, 3 failed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">2024-01-14 15:45</p>
                        <Badge variant="outline" className="text-xs">Partial</Badge>
                      </div>
                    </div>
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
