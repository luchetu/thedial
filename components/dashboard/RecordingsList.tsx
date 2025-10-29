"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Play, Pause, Volume2, Search, Tag, Clock, Phone, Calendar } from "lucide-react"

// Sample recordings data
const recordingsData = [
  {
    id: "1",
    callId: "call_001",
    duration: "00:02:34",
    timestamp: "2024-01-15 14:30:22",
    phoneNumber: "+1 (555) 123-4567",
    direction: "inbound",
    transcript: "Hello, this is John calling about the project update. I wanted to discuss the timeline and see if we can move the deadline up by a week. We have some concerns about the current deliverables and would like to schedule a meeting to go over the details.",
    summary: "Customer inquiry about project timeline and deadline adjustment",
    aiTags: ["Lead", "Project Discussion", "Timeline"],
    keywords: ["project", "timeline", "deadline", "meeting", "deliverables"],
    recordingUrl: "/recordings/call_001.mp3",
    isPlaying: false
  },
  {
    id: "2",
    callId: "call_002", 
    duration: "00:01:45",
    timestamp: "2024-01-15 13:15:10",
    phoneNumber: "+1 (555) 987-6543",
    direction: "outbound",
    transcript: "Hi Sarah, I'm calling to follow up on our meeting yesterday. Do you have those documents ready? Also, I wanted to confirm the next steps for the implementation phase.",
    summary: "Follow-up call regarding meeting documents",
    aiTags: ["Follow-up", "Document Request", "Implementation"],
    keywords: ["follow-up", "documents", "meeting", "implementation", "next steps"],
    recordingUrl: "/recordings/call_002.mp3",
    isPlaying: false
  },
  {
    id: "3",
    callId: "call_003",
    duration: "00:03:12",
    timestamp: "2024-01-15 11:20:15",
    phoneNumber: "+1 (555) 321-0987",
    direction: "outbound",
    transcript: "Good morning! This is regarding your account. I wanted to confirm your billing information and discuss the new features we're rolling out. Are you interested in upgrading to our premium plan?",
    summary: "Account confirmation and feature discussion",
    aiTags: ["Sales", "Account Management", "Upgrade"],
    keywords: ["account", "billing", "features", "upgrade", "premium"],
    recordingUrl: "/recordings/call_003.mp3",
    isPlaying: false
  },
  {
    id: "4",
    callId: "call_004",
    duration: "00:01:58",
    timestamp: "2024-01-15 10:15:42",
    phoneNumber: "+1 (555) 654-3210",
    direction: "inbound",
    transcript: "Hi, I'm calling about the support ticket I submitted. Can you help me resolve this issue? I'm experiencing problems with the login functionality.",
    summary: "Support ticket inquiry",
    aiTags: ["Support", "Technical Issue", "Login Problem"],
    keywords: ["support", "ticket", "login", "technical", "issue"],
    recordingUrl: "/recordings/call_004.mp3",
    isPlaying: false
  }
]

const directionConfig: Record<string, { label: string; color: string }> = {
  inbound: { label: "Inbound", color: "text-blue-600" },
  outbound: { label: "Outbound", color: "text-green-600" }
}

export function RecordingsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecording, setSelectedRecording] = useState<any>(null)
  const [recordings, setRecordings] = useState(recordingsData)

  const filteredRecordings = recordings.filter(recording => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      recording.transcript.toLowerCase().includes(searchLower) ||
      recording.summary.toLowerCase().includes(searchLower) ||
      recording.keywords.some((keyword: string) => keyword.toLowerCase().includes(searchLower)) ||
      recording.aiTags.some((tag: string) => tag.toLowerCase().includes(searchLower))
    )
  })

  const togglePlayback = (recordingId: string) => {
    setRecordings(prev => prev.map(recording => ({
      ...recording,
      isPlaying: recording.id === recordingId ? !recording.isPlaying : false
    })))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Recordings
        </CardTitle>
        <CardDescription>
          Call recordings with AI-powered insights and search
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by keywords, transcript, or AI tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Recordings List */}
        <div className="space-y-3">
          {filteredRecordings.map((recording) => {
            const directionInfo = directionConfig[recording.direction]
            
            return (
              <div key={recording.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Phone className={`h-5 w-5 ${directionInfo.color}`} />
                    <div>
                      <p className="font-medium">{recording.phoneNumber}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {recording.timestamp}
                        <Clock className="h-4 w-4 ml-2" />
                        {recording.duration}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePlayback(recording.id)}
                    >
                      {recording.isPlaying ? (
                        <Pause className="h-4 w-4 mr-1" />
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      {recording.isPlaying ? "Pause" : "Play"}
                    </Button>
                    
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRecording(recording)}
                        >
                          View Transcript
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[400px] sm:w-[540px]">
                        <SheetHeader>
                          <SheetTitle>Call Transcript</SheetTitle>
                          <SheetDescription>
                            {recording.phoneNumber} • {recording.timestamp}
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">AI Tags:</h4>
                            <div className="flex flex-wrap gap-2">
                              {recording.aiTags.map((tag: string) => (
                                <Badge key={tag} variant="secondary">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Summary:</h4>
                            <p className="text-sm text-muted-foreground">{recording.summary}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Full Transcript:</h4>
                            <div className="bg-muted/30 p-3 rounded text-sm">
                              {recording.transcript}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Keywords:</h4>
                            <div className="flex flex-wrap gap-1">
                              {recording.keywords.map((keyword: string) => (
                                <Badge key={keyword} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>

                {/* AI Tags */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">AI Suggestions:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recording.aiTags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Summary Preview */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Summary:</p>
                  <p className="text-sm">{recording.summary}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
