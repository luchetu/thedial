"use client"

import { cn } from "@/lib/utils"
import { useMemo, useState, useEffect, useRef } from "react"
import { ArrowUpDown, Check, Filter } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

import { Card, CardContent } from "@/components/ui/card"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, FileText, Play, Pause, Sparkles, Search, Volume2, UserPlus, StickyNote, PhoneCall, MoreHorizontal, MessageCircle, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useCallsInfinite } from "@/features/calls/hooks/useCallsInfinite"
import type { CallRecord, TranscriptionData } from "@/features/calls/api"
import { useCreateContact } from "@/features/contacts/hooks/useCreateContact"
import { ContactDialog } from "@/components/contacts/ContactDialog"
import { useContacts } from "@/features/contacts/hooks/useContacts"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { TranscriptView } from "@/components/dashboard/TranscriptView"
import { CallAIChat } from "@/components/dashboard/CallAIChat"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { type SortingState, type ColumnFiltersState } from "@tanstack/react-table"
import { DateTimePickerWithRange } from "@/components/ui/datetime-range-picker"
import type { DateRange } from "react-day-picker"

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

export const statuses = [
  {
    value: "answered",
    label: "Answered",
    icon: Check,
  },
  {
    value: "missed",
    label: "Missed",
    icon: Check,
  },
  {
    value: "failed",
    label: "Failed",
    icon: Check,
  },
  {
    value: "busy",
    label: "Busy",
    icon: Check,
  },
]

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
  className?: string
}

export function CallLogsList({ initialFilter, className }: CallLogsListProps) {
  const [viewTranscriptCall, setViewTranscriptCall] = useState<CallRecord | null>(null)

  // Table states
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialFilter && initialFilter !== "all" ? [{ id: "status", value: [initialFilter] }] : []
  )
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const [searchTerm, setSearchTerm] = useState<string>("")
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null)
  const [audioProgress, setAudioProgress] = useState<number>(0)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [addContactDialogOpen, setAddContactDialogOpen] = useState<string | null>(null)
  const [contactName, setContactName] = useState<string>("")
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const createContactMutation = useCreateContact()

  // Extract status and channel filter from columnFilters
  const statusFilterValue = (columnFilters.find(f => f.id === "status")?.value as string[])?.[0]
  const channelFilterValue = (columnFilters.find(f => f.id === "channel")?.value as string[])?.[0]

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useCallsInfinite({
    status: statusFilterValue,
    channel: channelFilterValue,
    fromDate: dateRange?.from?.toISOString(),
    toDate: dateRange?.to?.toISOString(),
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
      let normalized = phoneNumber.replace(/[\s\-\(\)]/g, "")
      if (normalized.startsWith("whatsapp:")) {
        normalized = normalized.replace("whatsapp:", "")
      }
      return contactMap.get(normalized) || null
    }
  }, [contactMap])

  // Flatten all pages into a single array
  const allCalls: CallRecord[] = useMemo(() => {
    if (!data) return []
    // @ts-expect-error - useInfiniteQuery returns InfiniteData with pages property
    return data.pages.flat() || []
  }, [data])

  // Filter calls by search term (client-side filtering)
  const filteredCalls = useMemo(() => {
    let filtered = allCalls

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
  }, [allCalls, searchTerm, getContactName])

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

  const handlePlayRecording = (call: CallRecord) => {
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
  }

  const columns: ColumnDef<CallRecord>[] = useMemo(() => [
    {
      accessorKey: "details",
      header: "Call Details",
      cell: ({ row }) => {
        const call = row.original
        const dir = call.direction || "inbound"

        // Detect channel from destination E164 prefix
        const isWhatsApp = (call.destinationE164?.startsWith("whatsapp:") || call.sourceE164?.startsWith("whatsapp:"))

        const DirectionIcon = isWhatsApp ? MessageCircle : (directionConfig[dir]?.icon ?? PhoneIncoming)
        const statusInfo = statusConfig[call.status] ?? statusConfig.answered

        let displayPhoneNumber = dir === "inbound" ? call.sourceE164 : call.destinationE164

        // Strip whatsapp: prefix for display
        if (displayPhoneNumber?.startsWith("whatsapp:")) {
          displayPhoneNumber = displayPhoneNumber.replace("whatsapp:", "")
        }

        const contactName = dir === "inbound" ? call.sourceContactName : call.destinationContactName
        const fallbackContactName = contactName || getContactName(displayPhoneNumber)
        const displayName = fallbackContactName || displayPhoneNumber || "Unknown"

        return (
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full", isWhatsApp ? "bg-green-100 text-green-600" : `bg-slate-100 ${statusInfo.iconColor}`)}>
              <DirectionIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-sm">{displayName}</p>
              {contactName && displayPhoneNumber && (
                <p className="text-xs text-muted-foreground">{displayPhoneNumber}</p>
              )}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "direction",
      header: "Direction",
      cell: ({ row }) => {
        const dir = row.original.direction || "inbound"
        return (
          <span className="capitalize">{dir === "inbound" ? "Incoming" : "Outgoing"}</span>
        )
      }
    },
    {
      id: "channel",
      accessorKey: "channel",
      header: ({ column }) => {
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
                <span>Channel</span>
                {column.getFilterValue() ? <Filter className="ml-2 h-3.5 w-3.5 text-primary" /> : <Filter className="ml-2 h-3.5 w-3.5 text-muted-foreground" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Filter channel..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {[{ value: "whatsapp", label: "WhatsApp" }, { value: "phone", label: "Phone" }].map((bg) => {
                      const isSelected = (column.getFilterValue() as string[])?.includes(bg.value)
                      return (
                        <CommandItem
                          key={bg.value}
                          onSelect={() => {
                            if (isSelected) {
                              column.setFilterValue(undefined)
                            } else {
                              column.setFilterValue([bg.value])
                            }
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <Check className={cn("h-4 w-4")} />
                          </div>
                          <span>{bg.label}</span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                  {!!column.getFilterValue() && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => column.setFilterValue(undefined)}
                          className="justify-center text-center"
                        >
                          Clear filters
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )
      },
      cell: ({ row }) => {
        const call = row.original
        const isWhatsApp = (call.destinationE164?.startsWith("whatsapp:") || call.sourceE164?.startsWith("whatsapp:"))
        return (
          <Badge variant="secondary" className={cn("font-normal capitalize", isWhatsApp ? "bg-green-100 text-green-700 hover:bg-green-100/80" : "bg-slate-100 text-slate-700 hover:bg-slate-100/80")}>
            {isWhatsApp ? "WhatsApp" : "Phone"}
          </Badge>
        )
      }
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
                <span>Status</span>
                {column.getFilterValue() ? <Filter className="ml-2 h-3.5 w-3.5 text-primary" /> : <Filter className="ml-2 h-3.5 w-3.5 text-muted-foreground" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Filter status..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {statuses.map((status) => {
                      const isSelected = (column.getFilterValue() as string[])?.includes(status.value)
                      return (
                        <CommandItem
                          key={status.value}
                          onSelect={() => {
                            const filterValues = (column.getFilterValue() as string[]) || []
                            if (isSelected) {
                              column.setFilterValue(undefined)
                            } else {
                              column.setFilterValue([status.value])
                            }
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <Check className={cn("h-4 w-4")} />
                          </div>
                          <span>{status.label}</span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                  {!!column.getFilterValue() && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => column.setFilterValue(undefined)}
                          className="justify-center text-center"
                        >
                          Clear filters
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )
      },
      cell: ({ row }) => {
        const status = row.original.status
        const statusInfo = statusConfig[status] ?? statusConfig.answered
        return (
          <Badge className={cn("capitalize", statusInfo.color)}>
            {statusInfo.label}
          </Badge>
        )
      }
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatDuration(row.original.durationSeconds)}
          </div>
        )
      }
    },
    {
      accessorKey: "startedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatTimestamp(row.original.startedAt)}</span>
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const call = row.original
        const hasRecording = Boolean(call.metadata?.recordingIds && (Array.isArray(call.metadata.recordingIds) ? call.metadata.recordingIds.length > 0 : true))
        const dir = call.direction || "inbound"
        const displayPhoneNumber = dir === "inbound" ? call.sourceE164 : call.destinationE164
        const hasContact = Boolean(call.sourceContactName || call.destinationContactName || getContactName(displayPhoneNumber))
        const displayName = getContactName(displayPhoneNumber) || displayPhoneNumber || "Unknown"
        const timestamp = formatTimestamp(call.startedAt)
        const duration = formatDuration(call.durationSeconds)

        return (
          <div className="flex items-center gap-2">
            {hasRecording && (
              <div className="flex items-center gap-2">
                {playingRecordingId === call.id && audioDuration > 0 && (
                  <div className="hidden sm:flex items-center gap-2 w-24">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-100" style={{ width: `${(audioProgress / audioDuration) * 100}%` }} />
                    </div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePlayRecording(call)}
                >
                  {playingRecordingId === call.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-zinc-200/50 shadow-xl w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                {/* AI & Insights */}
                <DropdownMenuItem onClick={() => {
                  // Open AI Assistant context
                  // For now we just open the sheet, but ideally this triggers the global assistant
                  setViewTranscriptCall(call)
                }}>
                  <Sparkles className="mr-2 h-4 w-4 text-purple-500" /> Ask AI
                </DropdownMenuItem>

                {call.status !== "missed" && (
                  <DropdownMenuItem onClick={() => setViewTranscriptCall(call)}>
                    <FileText className="mr-2 h-4 w-4" /> View Transcript
                  </DropdownMenuItem>
                )}

                {/* Communication */}
                {displayPhoneNumber && (
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/dial?number=${encodeURIComponent(displayPhoneNumber)}`}>
                      <PhoneCall className="mr-2 h-4 w-4" /> Call Back
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Data & Contact */}
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(displayPhoneNumber || "")}>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" /> Copy Number
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(call.id)}>
                  <div className="flex items-center">
                    <Search className="mr-2 h-4 w-4" /> Copy Call ID
                  </div>
                </DropdownMenuItem>

                {!hasContact && displayPhoneNumber && (
                  <DropdownMenuItem onClick={() => {
                    setAddContactDialogOpen(call.id)
                    setContactName("")
                  }}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Contact
                  </DropdownMenuItem>
                )}

                {hasContact && (
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/contacts?q=${encodeURIComponent(displayPhoneNumber || "")}`}>
                      <div className="flex items-center">
                        <UserPlus className="mr-2 h-4 w-4" /> View Profile
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Safety */}
                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4 rotate-45" /> Block Number
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    }
  ], [contactMap, getContactName, playingRecordingId, audioProgress, audioDuration])

  return (
    <Card className={cn("flex flex-col h-full border-0 shadow-none bg-transparent", className)}>
      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 pb-2 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by phone number or contact name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 backdrop-blur-sm"
            />
          </div>
          <DateTimePickerWithRange
            date={dateRange}
            setDate={setDateRange}
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
          <DataTable
            columns={columns}
            data={filteredCalls}
            isLoading={isLoading}
            sorting={sorting}
            onSortingChange={setSorting}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            manualFiltering={true}
          />

          <div ref={loadMoreRef} className="h-10 flex items-center justify-center mt-4">
            {isFetchingNextPage && (
              <p className="text-sm text-muted-foreground">Loading more calls...</p>
            )}
            {!hasNextPage && filteredCalls.length > 0 && (
              <p className="text-sm text-muted-foreground">No more calls to load</p>
            )}
            {!isLoading && filteredCalls.length === 0 && (
              <p className="text-sm text-muted-foreground">No calls found trying adjusting filters</p>
            )}
          </div>
        </div>

        {/* Add Contact Dialog */}
        <ContactDialog
          open={!!addContactDialogOpen}
          onOpenChange={(open) => !open && setAddContactDialogOpen(null)}
          initialPhoneNumber={addContactDialogOpen ? (allCalls.find(c => c.id === addContactDialogOpen)?.sourceE164 ?? undefined) : undefined}
          onSuccess={() => {
            setAddContactDialogOpen(null)
            setContactName("")
          }}
        />

        {/* Transcript Sheet */}
        <Sheet open={!!viewTranscriptCall} onOpenChange={(open) => !open && setViewTranscriptCall(null)}>
          <SheetContent className="w-full sm:w-[600px] lg:w-[700px] flex flex-col h-full p-0 gap-0">
            {viewTranscriptCall && (() => {
              const call = viewTranscriptCall
              const dir = call.direction || "inbound"
              const DirectionIcon = directionConfig[dir]?.icon ?? PhoneIncoming
              const statusInfo = statusConfig[call.status] ?? statusConfig.answered
              const displayPhoneNumber = dir === "inbound" ? call.sourceE164 : call.destinationE164
              const contactName = dir === "inbound" ? call.sourceContactName : call.destinationContactName
              const fallbackContactName = contactName || getContactName(displayPhoneNumber)
              const displayName = fallbackContactName || displayPhoneNumber || "Unknown"
              const timestamp = formatTimestamp(call.startedAt)
              const duration = formatDuration(call.durationSeconds)
              const transcription: TranscriptionData | undefined = call.metadata?.transcription

              return (
                <>
                  <SheetHeader className="p-6 border-b">
                    <SheetTitle>Call Transcript</SheetTitle>
                    <SheetDescription>
                      {displayName} {contactName && displayPhoneNumber && `(${displayPhoneNumber})`} • {timestamp} • {duration}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 flex flex-col min-h-0 p-6 gap-6 overflow-hidden">
                    {/* Call Information Summary */}
                    <div className="flex items-center gap-4 text-sm pb-4 border-b shrink-0">
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
                    <div className="flex-1 min-h-0 flex flex-col">
                      <TranscriptView
                        call={call}
                        resolveContactName={(phone) => getContactName(phone)}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t shrink-0">
                      {call.status !== "missed" && (
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline" className="flex-1 w-full">
                              <Sparkles className="h-4 w-4 mr-2" />
                              Ask AI
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:w-[500px] p-0 flex flex-col pt-10">
                            <CallAIChat call={call} />
                          </SheetContent>
                        </Sheet>
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
                </>
              )
            })()}
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  )
}
