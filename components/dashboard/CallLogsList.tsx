"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, FileText, Play, Pause, Sparkles, Search, Volume2, UserPlus, StickyNote, PhoneCall, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useCallsInfinite } from "@/features/calls/hooks/useCallsInfinite"
import type { CallRecord, TranscriptionData } from "@/features/calls/api"
import { useCreateContact } from "@/features/contacts/hooks/useCreateContact"
import { normalizeToE164 } from "@/lib/utils/phone"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useContacts } from "@/features/contacts/hooks/useContacts"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const statusConfig: Record<string, { label: string; color: string; iconColor: string }> = {
  answered: { label: "Answered", color: "bg-green-100 text-green-800", iconColor: "text-green-600" },
  missed: { label: "Missed", color: "bg-red-100 text-red-800", iconColor: "text-red-600" },
  busy: { label: "Busy", color: "bg-yellow-100 text-yellow-800", iconColor: "text-yellow-600" },
  failed: { label: "Failed", color: "bg-gray-100 text-gray-800", iconColor: "text-blue-600" }
}

const directionConfig: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  inbound: { label: "Inbound", icon: PhoneIncoming, color: "text-blue-600" },
  outbound: { label: "Outbound", icon: PhoneOutgoing, color: "text-green-600" }
}

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "00:00:00"
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
}

function formatTimestamp(iso?: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleString()
}

interface CallLogsListProps {
  initialFilter?: string
}

export function CallLogsList({ initialFilter }: CallLogsListProps) {
  const [direction, setDirection] = useState<string>("all")
  const [status, setStatus] = useState<string>(initialFilter || "all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [showRecordedOnly, setShowRecordedOnly] = useState<boolean>(false)
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null)
  const [audioProgress, setAudioProgress] = useState<number>(0)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [addContactDialogOpen, setAddContactDialogOpen] = useState<string | null>(null)
  const [contactName, setContactName] = useState<string>("")
  const loadMoreRef = useRef<HTMLDivElement>(null)
  
  const createContactMutation = useCreateContact()

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useCallsInfinite({
    direction: direction === "all" ? undefined : direction,
    status: status === "all" ? undefined : status,
  })

  // Fetch contacts to match phone numbers with names
  const { data: contacts } = useContacts()

  // Create a lookup map from phone number to contact name
  const contactMap = useMemo(() => {
    if (!contacts) return new Map<string, string>()
    const map = new Map<string, string>()
    contacts.forEach((contact) => {
      // Normalize phone numbers for matching (remove spaces, dashes, etc.)
      const normalized = contact.phone_number.replace(/[\s\-\(\)]/g, "")
      map.set(normalized, contact.name)
    })
    return map
  }, [contacts])

  // Helper function to get contact name from phone number
  const getContactName = useMemo(() => {
    return (phoneNumber?: string | null): string | null => {
      if (!phoneNumber) return null
      const normalized = phoneNumber.replace(/[\s\-\(\)]/g, "")
      return contactMap.get(normalized) || null
    }
  }, [contactMap])

  // Flatten all pages into a single array
  const allCalls: CallRecord[] = useMemo(() => {
    if (!data) return []
    // @ts-expect-error - useInfiniteQuery returns InfiniteData with pages property
    return data.pages.flat() || []
  }, [data])

  // Filter calls by search term and recording status (client-side filtering)
  const filteredCalls = useMemo(() => {
    let filtered = allCalls
    
    // Filter by recording status
    if (showRecordedOnly) {
      filtered = filtered.filter((call: CallRecord) => {
        return Boolean(call.metadata?.recordingIds && 
          (Array.isArray(call.metadata.recordingIds) ? call.metadata.recordingIds.length > 0 : true))
      })
    }
    
    // Filter by search term (phone number or contact name)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((call: CallRecord) => {
        const source = call.sourceE164?.toLowerCase() || ""
        const dest = call.destinationE164?.toLowerCase() || ""
        const sourceName = getContactName(call.sourceE164)?.toLowerCase() || ""
        const destName = getContactName(call.destinationE164)?.toLowerCase() || ""
        return source.includes(search) || dest.includes(search) || 
               sourceName.includes(search) || destName.includes(search)
      })
    }
    
    return filtered
  }, [allCalls, searchTerm, showRecordedOnly, getContactName])

  // Infinite scroll: observe the load more element
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Call Logs
        </CardTitle>
          <span className="text-muted-foreground">|</span>
          <CardDescription className="m-0">
            Unified list of inbound + outbound calls with infinite scroll
        </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by phone number or contact name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={direction} onValueChange={setDirection}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Directions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Directions</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
              <SelectItem value="outbound">Outbound</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="answered">Answered</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={showRecordedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowRecordedOnly(!showRecordedOnly)}
            className="w-full sm:w-auto"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            {showRecordedOnly ? "Show All" : "Recorded Only"}
          </Button>
        </div>

        {isLoading && !data && (
          <p className="text-sm text-muted-foreground">Loading call history...</p>
        )}
        {isError && !isLoading && (
          <p className="text-sm text-destructive">Failed to load call history.</p>
        )}

        {filteredCalls.length === 0 && !isLoading && !isError ? (
          <div className="text-center py-8">
            <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No calls found{searchTerm || (direction !== "all") || (status !== "all") || showRecordedOnly ? " matching your filters" : ""}.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {filteredCalls.map((call: CallRecord) => {
                const dir = call.direction || "inbound"
                const DirectionIcon = directionConfig[dir]?.icon ?? PhoneIncoming
                const statusInfo = statusConfig[call.status] ?? statusConfig.answered
                
                // Determine which phone number and contact name to display based on call direction
                const displayPhoneNumber = dir === "inbound" 
                  ? call.sourceE164 
                  : call.destinationE164
                // Use contact name from API response, fallback to client-side lookup, then phone number
                const contactName = dir === "inbound" 
                  ? call.sourceContactName 
                  : call.destinationContactName
                const fallbackContactName = contactName || getContactName(displayPhoneNumber)
                const displayName = fallbackContactName || displayPhoneNumber || "Unknown"
                const hasContact = Boolean(contactName || getContactName(displayPhoneNumber))
                
                const timestamp = formatTimestamp(call.startedAt)
                const duration = formatDuration(call.durationSeconds ?? null)
              const transcribed = Boolean(call.metadata?.transcription)
              const transcription: TranscriptionData | undefined = call.metadata?.transcription
                
                return (
                <div key={call.id} className="border rounded-lg p-5 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <DirectionIcon className={`h-5 w-5 ${statusInfo.iconColor ?? directionConfig[dir]?.color ?? "text-blue-600"}`} />
                        <div>
                          <p className="font-medium">{displayName}</p>
                          {contactName && displayPhoneNumber && (
                            <p className="text-xs text-muted-foreground">{displayPhoneNumber}</p>
                          )}
                          <p className="text-sm text-muted-foreground">{timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {duration}
                        </div>
                      </div>
                    </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex items-center gap-2" />
                      
                      <div className={`flex items-center gap-2 ${playingRecordingId === call.id ? 'flex-1 min-w-0' : ''}`}>
                        {call.status !== "missed" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (playingRecordingId === call.id) {
                                  // Stop audio playback
                                  if (audioRef.current) {
                                    audioRef.current.pause()
                                    audioRef.current.currentTime = 0
                                    audioRef.current = null
                                  }
                                  if (progressIntervalRef.current) {
                                    clearInterval(progressIntervalRef.current)
                                    progressIntervalRef.current = null
                                  }
                                  setPlayingRecordingId(null)
                                  setAudioProgress(0)
                                  setAudioDuration(0)
                                } else {
                                  // Stop any currently playing audio
                                  if (audioRef.current) {
                                    audioRef.current.pause()
                                    audioRef.current.currentTime = 0
                                  }
                                  if (progressIntervalRef.current) {
                                    clearInterval(progressIntervalRef.current)
                                    progressIntervalRef.current = null
                                  }

                                  // Get recording URLs from metadata
                                  const recordingUrls = call.metadata?.recordingUrls
                                    ? (Array.isArray(call.metadata.recordingUrls) 
                                        ? call.metadata.recordingUrls 
                                        : [call.metadata.recordingUrls])
                                    : []

                                  if (recordingUrls.length > 0) {
                                    // Play the first recording URL
                                    const audio = new Audio(recordingUrls[0])
                                    audioRef.current = audio
                                    setPlayingRecordingId(call.id)

                                    // Set up progress tracking
                                    audio.addEventListener('loadedmetadata', () => {
                                      setAudioDuration(audio.duration)
                                    })

                                    audio.addEventListener('timeupdate', () => {
                                      setAudioProgress(audio.currentTime)
                                    })

                                    // Start progress tracking
                                    progressIntervalRef.current = setInterval(() => {
                                      if (audioRef.current) {
                                        setAudioProgress(audioRef.current.currentTime)
                                      }
                                    }, 100)

                                    audio.play().catch((err) => {
                                      console.error("Error playing recording:", err)
                                      toast.error("Unable to play recording", {
                                        description: "The recording file may not be accessible. Please check your connection or try again later."
                                      })
                                      setPlayingRecordingId(null)
                                      setAudioProgress(0)
                                      setAudioDuration(0)
                                      audioRef.current = null
                                      if (progressIntervalRef.current) {
                                        clearInterval(progressIntervalRef.current)
                                        progressIntervalRef.current = null
                                      }
                                    })

                                    // Clean up when audio ends
                                    audio.onended = () => {
                                      setPlayingRecordingId(null)
                                      setAudioProgress(0)
                                      setAudioDuration(0)
                                      audioRef.current = null
                                      if (progressIntervalRef.current) {
                                        clearInterval(progressIntervalRef.current)
                                        progressIntervalRef.current = null
                                      }
                                    }

                                    // Handle errors
                                    audio.onerror = () => {
                                      console.error("Error loading recording:", recordingUrls[0])
                                      toast.error("Unable to load recording", {
                                        description: "The recording file could not be loaded. It may have been moved or deleted."
                                      })
                                      setPlayingRecordingId(null)
                                      setAudioProgress(0)
                                      setAudioDuration(0)
                                      audioRef.current = null
                                      if (progressIntervalRef.current) {
                                        clearInterval(progressIntervalRef.current)
                                        progressIntervalRef.current = null
                                      }
                                    }
                                  } else {
                                    // No recording available
                                    toast.info("No recording available", {
                                      description: "This call does not have a recording. Recordings are only available for answered calls."
                                    })
                                  }
                                }
                              }}
                            >
                              {playingRecordingId === call.id ? (
                                <>
                                  <Pause className="h-4 w-4 mr-1" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  Play
                                </>
                              )}
                            </Button>
                            {/* Audio progress indicator */}
                            {playingRecordingId === call.id && audioDuration > 0 && (
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary transition-all duration-100"
                                    style={{ width: `${(audioProgress / audioDuration) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {Math.floor(audioProgress / 60)}:{(Math.floor(audioProgress % 60)).toString().padStart(2, '0')} / {Math.floor(audioDuration / 60)}:{(Math.floor(audioDuration % 60)).toString().padStart(2, '0')}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        {displayPhoneNumber && (
                          <Link 
                            href={`/dashboard/dial?number=${encodeURIComponent(displayPhoneNumber)}`}
                          >
                            <Button 
                              variant="outline" 
                              size="sm"
                            >
                              <PhoneCall className="h-4 w-4 mr-1" />
                              Call
                            </Button>
                          </Link>
                        )}
                        {call.status !== "missed" && transcribed && (
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                              >
                              <FileText className="h-4 w-4 mr-1" />
                                View Transcript
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:w-[600px] lg:w-[700px] overflow-y-auto">
                              <SheetHeader>
                                <SheetTitle>Call Transcript</SheetTitle>
                                <SheetDescription>
                                  {displayName} {contactName && displayPhoneNumber && `(${displayPhoneNumber})`} • {timestamp} • {duration}
                                </SheetDescription>
                              </SheetHeader>
                              <div className="mt-6 space-y-6 px-4">
                                {/* Call Information Summary */}
                                <div className="flex items-center gap-4 text-sm pb-4 border-b">
                                  <div className="flex items-center gap-2">
                                    <DirectionIcon className={`h-4 w-4 ${directionConfig[dir]?.color ?? "text-blue-600"}`} />
                                    <span className="text-muted-foreground">{directionConfig[dir]?.label || dir}</span>
                                  </div>
                                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                                  {call.sourceE164 && call.destinationE164 && (() => {
                                    const fromNumber = dir === 'inbound' ? call.sourceE164 : call.destinationE164
                                    const toNumber = dir === 'inbound' ? call.destinationE164 : call.sourceE164
                                    const fromName = getContactName(fromNumber)
                                    const toName = getContactName(toNumber)
                                    return (
                                      <span className="text-muted-foreground">
                                        {fromName || fromNumber} → {toName || toNumber}
                                      </span>
                                    )
                                  })()}
                                </div>

                                {/* Transcript with Timeline */}
                                {transcription && (
                                  <div className="space-y-4">
                                    <h4 className="font-medium text-sm">Conversation</h4>
                                    <div className="space-y-4">
                                      {(() => {
                                        const transcriptText = transcription?.text || transcription?.summary || ""
                                        // Parse transcript text to extract speaker turns
                                        const lines = transcriptText.split('\n').filter(line => line.trim())
                                        const turns: Array<{ speaker: string; text: string; time?: string }> = []
                                        
                                        lines.forEach((line, index) => {
                                          // Match patterns like "Agent:", "Customer:", "Agent: text", etc.
                                          const speakerMatch = line.match(/^(Agent|Customer|User|Caller):\s*(.*)$/i)
                                          if (speakerMatch) {
                                            const [, speaker, text] = speakerMatch
                                            // Calculate approximate time based on position (rough estimate)
                                            const estimatedSeconds = Math.floor((index / lines.length) * (call.durationSeconds || 0))
                                            const minutes = Math.floor(estimatedSeconds / 60)
                                            const seconds = estimatedSeconds % 60
                                            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
                                            
                                            turns.push({
                                              speaker: speaker.charAt(0).toUpperCase() + speaker.slice(1).toLowerCase(),
                                              text: text.trim(),
                                              time: timeStr
                                            })
                                          } else if (line.trim()) {
                                            // If no speaker label, append to last turn or create a new one
                                            if (turns.length > 0) {
                                              turns[turns.length - 1].text += ' ' + line.trim()
                                            } else {
                                              turns.push({
                                                speaker: 'Unknown',
                                                text: line.trim()
                                              })
                                            }
                                          }
                                        })

                                        // If we couldn't parse turns, show the full text
                                        if (turns.length === 0) {
                                          return (
                                            <div className="bg-muted/30 p-4 rounded-lg">
                                              <p className="text-sm whitespace-pre-wrap">{transcriptText}</p>
                                            </div>
                                          )
                                        }

                                        return turns.map((turn, idx) => {
                                          const isAgent = turn.speaker.toLowerCase() === 'agent'
                                          return (
                                            <div key={idx} className={`flex gap-3 ${isAgent ? 'flex-row-reverse' : ''}`}>
                                              <div className={`flex-1 ${isAgent ? 'text-right' : ''}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className="text-xs font-medium text-muted-foreground">
                                                    {turn.speaker}
                                                  </span>
                                                  {turn.time && (
                                                    <span className="text-xs text-muted-foreground">
                                                      {turn.time}
                                                    </span>
                                                  )}
                                                </div>
                                                <div className={`inline-block p-3 rounded-lg ${
                                                  isAgent 
                                                    ? 'bg-primary/10 text-primary-foreground' 
                                                    : 'bg-muted/50'
                                                }`}>
                                                  <p className="text-sm whitespace-pre-wrap">{turn.text}</p>
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        })
                                      })()}
                                    </div>
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t">
                                  {call.status !== "missed" && (
                                    <Link href="/dashboard/calls/ai-assistant" className="flex-1">
                                      <Button variant="outline" className="w-full">
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Ask AI
                                      </Button>
                                    </Link>
                                  )}
                                  {call.status === "answered" && (
                                    <Button 
                                      variant="outline" 
                                      className="flex-1"
                                      onClick={() => {
                                        // TODO: Implement generate notes functionality
                                        console.log("Generate notes for call:", call.id);
                                      }}
                                    >
                                      <StickyNote className="h-4 w-4 mr-2" />
                                      Generate Notes
                                    </Button>
                                  )}
                                  {Boolean(call.metadata && call.metadata.recordingIds) && (
                                    <Button variant="outline" className="flex-1">
                                      <Play className="h-4 w-4 mr-2" />
                                      Play Recording
                            </Button>
                                  )}
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                        )}
                          {!hasContact && displayPhoneNumber && (
                            <Dialog open={addContactDialogOpen === call.id} onOpenChange={(open) => {
                              setAddContactDialogOpen(open ? call.id : null)
                              if (!open) setContactName("")
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="default" size="sm">
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Add Contact
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add to Contacts</DialogTitle>
                                  <DialogDescription>
                                    Add {displayPhoneNumber} to your contacts list
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="contact-name">Name</Label>
                                    <Input
                                      id="contact-name"
                                      placeholder="Enter contact name"
                                      value={contactName || ""}
                                      onChange={(e) => setContactName(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="contact-phone">Phone Number</Label>
                                    <Input
                                      id="contact-phone"
                                      value={displayPhoneNumber || ""}
                                      disabled
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setAddContactDialogOpen(null)
                                      setContactName("")
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    onClick={() => {
                                      const name = contactName?.trim()
                                      if (name && displayPhoneNumber) {
                                        createContactMutation.mutate(
                                          {
                                            name: name,
                                            phone_number: normalizeToE164(displayPhoneNumber),
                                          },
                                          {
                                            onSuccess: () => {
                                              setAddContactDialogOpen(null)
                                              setContactName("")
                                            },
                                          }
                                        )
                                      }
                                    }}
                                    disabled={!contactName?.trim() || createContactMutation.isPending}
                                  >
                                    {createContactMutation.isPending ? "Adding..." : "Add Contact"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
              {isFetchingNextPage && (
                <p className="text-sm text-muted-foreground">Loading more calls...</p>
              )}
              {!hasNextPage && filteredCalls.length > 0 && (
                <p className="text-sm text-muted-foreground">No more calls to load</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
