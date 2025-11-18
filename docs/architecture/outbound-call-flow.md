# Outbound Call Flow Architecture

This document explains how an outbound call flows from the frontend browser through the Go backend to LiveKit, Twilio, and finally the AI transcription agent.

## Overview Diagram

```
[Browser] → [Go Backend] → [LiveKit] → [AI Agent]
                      ↓
                 [Twilio SIP]
                      ↓
              [Phone Number]
```

## Detailed Flow

### 1. Frontend: User Initiates Call

**File:** `thedial/components/livekit/OutboundCallDialer.tsx`

```typescript
// User selects phone number and enters destination, then clicks "Call"
const handleDial = async () => {
  const result = await createOutboundCall({
    phoneNumber: destinationNumber.trim(), // "+14155551234" (destination)
    phoneNumberId: selectedPhoneNumberId, // Backend looks up SIP trunk from this
    agentName: "telephony-agent", // AI agent name
    userIdentity: `user-${user.id}`, // Browser user ID
  });

  // Switch UI to call interface
  onCallStart({ roomName: result.room, identity: `user-${user.id}` });
};
```

**What happens:**

1. User selects their phone number from dropdown (e.g., "+18783488316")
2. User enters destination phone number (e.g., "+14155551234")
3. Frontend calls `createOutboundCall()` API function with:
   - Destination phone number
   - Selected phone number ID (for looking up SIP trunk)
   - Agent name and user identity
4. This sends a POST request to `/livekit/calls/outbound`

---

### 2. Frontend API Layer

**File:** `thedial/features/livekit/api.ts`

```typescript
export function createOutboundCall(input: CreateOutboundCallRequest) {
  return http<OutboundCallResponse>(`/livekit/calls/outbound`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
```

**Request payload:**

```json
{
  "phoneNumber": "+14155551234",
  "phoneNumberId": "0640d3fb-dc5d-4d25-b40b-68eb100d9a28",
  "agentName": "telephony-agent",
  "userIdentity": "user-abc123"
}
```

**What happens:**

- HTTP POST to `http://localhost:8080/livekit/calls/outbound`
- Body contains destination phone number, user's phone number ID (for SIP trunk lookup), agent name, and user identity
- Backend responds with room details:
  ```json
  {
    "data": {
      "room": "call-123e4567-e89b-12d3-a456-426614174000",
      "participant": "user-abc123",
      "sipParticipant": {...}
    }
  }
  ```

---

### 3. Backend: Go Handler Processes Request

**File:** `thedial-server/internal/handler/livekit_handler.go`

**Function:** `CreateOutboundCall()`

```go
// Step 1: Parse request
var req struct {
    PhoneNumber   string `json:"phoneNumber"`    // Destination: "+14155551234"
    PhoneNumberID string `json:"phoneNumberId"`  // User's phone number ID
    AgentName     string `json:"agentName"`
    UserIdentity  string `json:"userIdentity"`
}

// Step 2: Look up user's phone number from database
phoneNumber, err := h.phoneSvc.GetByID(r.Context(), phoneNumberID)

// Step 3: Look up SIP trunk ID from LiveKit
trunks, err := h.sipClient.ListSIPOutboundTrunk(...)
sipTrunkID := trunks.Items[0].SipTrunkId  // Get first available trunk

// Step 4: Generate unique room name
roomName := "call-" + uuid.New().String()  // e.g., "call-123e4567-e89b-12d3-a456-426614174000"

// Step 5: Create metadata for agent
metadata := map[string]string{"phone_number": req.PhoneNumber}
metadataJSON, _ := json.Marshal(metadata)  // {"phone_number":"+14155551234"}
```

**What happens:**

1. Backend receives HTTP request
2. Validates required fields (phoneNumber, phoneNumberId)
3. **Looks up user's phone number** from database using `phoneNumberId`
4. **Looks up SIP trunk ID** from LiveKit (searches available outbound trunks)
5. Generates unique room name
6. Creates metadata JSON for the AI agent
7. Proceeds to two parallel operations (see below)

---

### 4A. Backend: Dispatch AI Agent to Room

**File:** `thedial-server/internal/handler/livekit_handler.go` (lines 232-240)

```go
// Dispatch agent to the room
_, err := h.agentDispatch.CreateDispatch(context.Background(), &livekit.CreateAgentDispatchRequest{
    AgentName: req.AgentName,        // "telephony-agent"
    Room:      roomName,              // "call-123e4567-..."
    Metadata:  string(metadataJSON),  // {"phone_number":"+14155551234"}
})
```

**What happens:**

1. Backend calls LiveKit's Agent Dispatch API
2. Tells LiveKit: "Send agent named 'telephony-agent' to room 'call-123e4567...'"
3. LiveKit broadcasts a dispatch event
4. Python agent running elsewhere receives the event
5. Agent joins the room and starts listening

**Python Agent Side:**

```python
async def entrypoint(ctx: JobContext):
    # Agent receives dispatch event from LiveKit
    # Joins the specified room automatically
    print(f"Agent joining room: {ctx.room.name}")

    # Gets metadata from job context
    dial_info = json.loads(ctx.job.metadata)
    phone_number = dial_info["phone_number"]  # "+14155551234"
```

---

### 4B. Backend: Dial Phone via SIP

**File:** `thedial-server/internal/handler/livekit_handler.go` (lines 243-253)

```go
// Create SIP participant to dial the phone number
sipParticipant, err := h.sipClient.CreateSIPParticipant(context.Background(), &livekit.CreateSIPParticipantRequest{
    SipTrunkId:          sipTrunkID,             // "ST_xxxx" (looked up from LiveKit)
    SipCallTo:           req.PhoneNumber,        // "+14155551234" (destination)
    RoomName:            roomName,                 // "call-123e4567-..."
    ParticipantIdentity: participantIdentity,      // "user-abc123"
    WaitUntilAnswered:   true,                    // Wait for pickup
})
```

**What happens:**

1. Backend calls LiveKit's SIP API with the looked-up SIP trunk ID
2. Tells LiveKit: "Dial +14155551234 using trunk ST_xxxx and join room call-123e4567..."
3. **LiveKit internally calls Twilio** to initiate the phone call
4. Twilio calls the destination phone number
5. When answered, the phone becomes a participant in the LiveKit room
6. Audio flows: Phone ↔ LiveKit ↔ Room

**Important:** The backend does NOT directly call Twilio here. LiveKit handles the Twilio integration via its SIP trunk configuration.

---

### 5. Frontend Switches to Call Interface

**File:** `thedial/app/(dashboard)/dashboard/calls/dial/page.tsx`

```typescript
// After successful API call
onCallStart({ roomName: result.room, identity: `user-${user.id}` });

// This triggers UI switch
if (activeCall) {
  return (
    <CallInterface
      roomName={activeCall.roomName}
      identity={activeCall.identity}
    />
  );
}
```

### 6. Browser Joins the Room

**File:** `thedial/components/livekit/CallInterface.tsx`

```typescript
// Get LiveKit token
const { data: tokenData } = useLiveKitToken(roomName, identity);

// Connect to room
const room = new Room();
room.on(RoomEvent.Connected, () => setIsConnected(true));
room.on(RoomEvent.ParticipantConnected, (participant) => {
  setParticipants((prev) => [...prev, participant]);
});
await room.connect(tokenData.url, tokenData.token);
```

**What happens:**

1. Frontend gets room name from backend response (`result.room`)
2. Calls `GET /livekit/token?room=call-123...&identity=user-abc123`
3. Backend returns JWT token with room join permissions
4. Browser connects to LiveKit room using WebRTC
5. Enables microphone automatically
6. Audio flows: Browser ↔ LiveKit ↔ Room
7. UI shows participant count, mute/unmute controls, and disconnect button

---

### 7. All Three Participants Connected

At this point, three participants are in the room:

```
┌─────────────────────────────────────────┐
│         LiveKit Room                    │
│    "call-123e4567-e89b-12d3..."         │
│                                         │
│  ┌───────────┐  ┌──────────┐  ┌─────┐ │
│  │  Browser  │  │   AI     │  │Phone│ │
│  │  User     │  │  Agent   │  │     │ │
│  │           │  │          │  │     │ │
│  └───────────┘  └──────────┘  └─────┘ │
│                                         │
└─────────────────────────────────────────┘
```

**AI Agent automatically:**

- Transcribes all audio in real-time
- Can respond to voice commands
- Provides conversation summaries
- Accessible via function tools

**Audio flow:**

- Browser → Agent: User speaks
- Agent → Browser: AI responds
- Phone → Agent: Caller speaks
- Agent → Phone: AI responds
- All three can hear each other

---

## Key Concepts

### LiveKit Acts as a Bridge

LiveKit is the central hub that:

1. Receives audio from browser (WebRTC)
2. Receives audio from phone (SIP/Twilio)
3. Sends audio to AI agent (WebRTC)
4. Routes audio between all participants

### Twilio is NOT Called Directly

Your Go backend does NOT use `twilio.NewRestClient()` for outbound calls in this flow. Instead:

- You configure Twilio SIP trunk in LiveKit
- LiveKit handles Twilio integration
- Go backend only calls LiveKit's SIP API

### Agent is Dispatched BEFORE Call

The AI agent joins BEFORE the phone is dialed:

1. Agent joins empty room
2. Phone is dialed
3. Phone joins room with agent
4. Both are already connected when browser joins

### Metadata Flow

```javascript
Browser → Backend → Agent
{phoneNumber: "+14155551234"} → JSON → {phone_number: "+14155551234"}
```

Agent receives phone number in metadata, allowing it to:

- Know who was called
- Customize responses
- Log conversations

---

## Configuration Required

### Frontend

```bash
# No special config needed
# Uses same origin as API
```

### Backend (.env)

```bash
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

### LiveKit Server

```yaml
# Must have Twilio SIP trunk configured
trunks:
  - id: ST_xxxx
    inbound: false
    outbound: true
    provider: twilio
```

### Python Agent

```bash
# Must be running and listening for dispatch events
python agent.py dev
```

---

## Error Handling

### Backend Errors

- `LIVEKIT_NOT_CONFIGURED`: Missing credentials
- `AGENT_DISPATCH_ERROR`: Agent not available
- `SIP_ERROR`: Failed to dial phone
- `BAD_REQUEST`: Missing required fields

### Frontend Errors

- Network error → retry UI
- 401 Unauthorized → redirect to login
- 500 Server error → show error message

---

## Testing the Flow

1. Start all services:

   ```bash
   # Terminal 1: LiveKit server
   livekit-server

   # Terminal 2: Go backend
   cd thedial-server && go run cmd/server/main.go

   # Terminal 3: Python agent
   python agent.py dev

   # Terminal 4: Frontend
   cd thedial && npm run dev
   ```

2. Make a call:

   - Go to http://localhost:3000/calls
   - Enter phone number
   - Click "Call"
   - Watch all three terminals for logs

3. Verify audio:
   - Browser user speaks → should hear in phone
   - Phone caller speaks → should hear in browser + transcribed by agent
   - All participants hear AI responses

---

## Summary

**Simple version:**

1. User selects their phone number and enters destination → clicks "Call"
2. Browser → asks backend to make call (with phoneNumberId for SIP trunk lookup)
3. Backend → looks up SIP trunk, tells LiveKit to dial phone + start AI agent
4. LiveKit → calls destination phone via Twilio + notifies agent
5. AI agent joins room → starts transcribing
6. Phone answers → joins room
7. Browser joins → three-way conversation with AI transcription

**The magic:** LiveKit handles all the real-time audio routing and synchronization. Your code just orchestrates which participants join which rooms.

## Key Implementation Details

### Phone Number Selection

- Users can have multiple phone numbers
- Frontend fetches user's phone numbers automatically (no userId needed - uses JWT)
- User selects which number to use for calling via dropdown
- Backend looks up SIP trunk associated with selected phone number

### SIP Trunk Lookup

Instead of hardcoding SIP trunk IDs:

- Backend queries LiveKit for available outbound trunks
- Uses first available trunk (TODO: match by phone number precisely)
- Returns error if no trunk found

### Error Handling

**Frontend:**

- Displays loading state while connecting
- Shows error message if API call fails
- Handles session expiration gracefully

**Backend:**

- Validates phone number ownership before allowing call
- Returns descriptive errors for missing trunks, agent failures, etc.
- Validates E.164 format for phone numbers
