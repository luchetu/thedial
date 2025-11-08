"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, Tag, FileText, Play, Sparkles, type LucideIcon } from "lucide-react"
import Link from "next/link"

const callLogsData = [
  {
    id: "1",
    direction: "inbound",
    status: "answered",
    duration: "00:02:34",
    timestamp: "2024-01-15 14:30:22",
    phoneNumber: "+1 (555) 123-4567",
    transcript: "Hello, this is John calling about the project update. I wanted to discuss the timeline and see if we can move the deadline up by a week.",
    tags: ["project", "timeline"],
    summary: "Customer inquiry about project timeline and deadline adjustment",
    recorded: true,
    transcribed: true
  },
  {
    id: "2", 
    direction: "outbound",
    status: "answered",
    duration: "00:01:45",
    timestamp: "2024-01-15 13:15:10",
    phoneNumber: "+1 (555) 987-6543",
    transcript: "Hi Sarah, I'm calling to follow up on our meeting yesterday. Do you have those documents ready?",
    tags: ["follow-up", "documents"],
    summary: "Follow-up call regarding meeting documents",
    recorded: true,
    transcribed: true
  },
  {
    id: "3",
    direction: "inbound", 
    status: "missed",
    duration: "00:00:00",
    timestamp: "2024-01-15 12:45:33",
    phoneNumber: "+1 (555) 456-7890",
    transcript: "",
    tags: ["urgent"],
    summary: "Missed call - no voicemail",
    recorded: false,
    transcribed: false
  },
  {
    id: "4",
    direction: "outbound",
    status: "answered", 
    duration: "00:03:12",
    timestamp: "2024-01-15 11:20:15",
    phoneNumber: "+1 (555) 321-0987",
    transcript: "Good morning! This is regarding your account. I wanted to confirm your billing information and discuss the new features we're rolling out.",
    tags: ["billing", "features"],
    summary: "Account confirmation and feature discussion",
    recorded: true,
    transcribed: true
  },
  {
    id: "5",
    direction: "inbound",
    status: "answered",
    duration: "00:01:58", 
    timestamp: "2024-01-15 10:15:42",
    phoneNumber: "+1 (555) 654-3210",
    transcript: "Hi, I'm calling about the support ticket I submitted. Can you help me resolve this issue?",
    tags: ["support", "ticket"],
    summary: "Support ticket inquiry",
    recorded: true,
    transcribed: true
  }
]

const statusConfig: Record<string, { label: string; color: string }> = {
  answered: { label: "Answered", color: "bg-green-100 text-green-800" },
  missed: { label: "Missed", color: "bg-red-100 text-red-800" },
  busy: { label: "Busy", color: "bg-yellow-100 text-yellow-800" },
  failed: { label: "Failed", color: "bg-gray-100 text-gray-800" }
}

const directionConfig: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  inbound: { label: "Inbound", icon: PhoneIncoming, color: "text-blue-600" },
  outbound: { label: "Outbound", icon: PhoneOutgoing, color: "text-green-600" }
}

export function CallLogsList() {
  const [activeFilter, setActiveFilter] = useState("all")

  const filteredLogs = callLogsData.filter(log => {
    switch (activeFilter) {
      case "missed":
        return log.status === "missed"
      case "answered":
        return log.status === "answered"
      case "recorded":
        return log.recorded
      case "transcribed":
        return log.transcribed
      default:
        return true
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Call Logs
        </CardTitle>
        <CardDescription>
          Unified list of inbound + outbound calls from Twilio call logs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="missed">Missed</TabsTrigger>
            <TabsTrigger value="answered">Answered</TabsTrigger>
            <TabsTrigger value="recorded">Recorded</TabsTrigger>
            <TabsTrigger value="transcribed">Transcribed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeFilter} className="mt-4">
            <div className="space-y-3">
              {filteredLogs.map((call) => {
                const DirectionIcon = directionConfig[call.direction].icon
                const statusInfo = statusConfig[call.status]
                
                return (
                  <div key={call.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <DirectionIcon className={`h-5 w-5 ${directionConfig[call.direction].color}`} />
                        <div>
                          <p className="font-medium">{call.phoneNumber}</p>
                          <p className="text-sm text-muted-foreground">{call.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {call.duration}
                        </div>
                      </div>
                    </div>

                    {call.transcript && (
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground mb-1">Transcript:</p>
                        <p className="text-sm bg-muted/30 p-2 rounded text-muted-foreground">
                          {call.transcript}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {call.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {call.recorded && (
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Play
                          </Button>
                        )}
                        {call.transcribed && (
                          <>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              View Full
                            </Button>
                            <Link href="/dashboard/calls/ai-assistant">
                              <Button variant="outline" size="sm">
                                <Sparkles className="h-4 w-4 mr-1" />
                                Ask AI
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm font-medium text-muted-foreground">Summary:</p>
                      <p className="text-sm">{call.summary}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
