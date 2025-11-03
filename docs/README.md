# TheDial Documentation

Welcome to TheDial documentation. This directory contains guides for setting up and using the various features of TheDial.

## Setup Guides

### AI Transcription Agent

- **[AI Transcription Agent Setup](./setup/ai-transcription-agent.md)** - Configure the Python agent for real-time call transcription

## User Stories

### Phone Management

- **[Phone Management User Stories](./user-stories/phone-management.md)** - Features and workflows for managing phone numbers

## Architecture

### Outbound Call Flow

- **[Outbound Call Flow](./architecture/outbound-call-flow.md)** - Detailed explanation of how calls flow from browser → backend → LiveKit → Twilio → AI agent

## Features Overview

### Browser Calling with LiveKit

- Real-time audio communication
- Multi-participant support
- Automatic room management

### AI Transcription

- Real-time speech-to-text
- Automatic conversation summaries
- Searchable call history

### Phone Number Management

- Purchase phone numbers via Twilio
- Configure forwarding rules
- Manage capabilities (voice, SMS, MMS)

## Quick Start

1. Set up LiveKit server
2. Configure AI transcription agent (see [setup guide](./setup/ai-transcription-agent.md))
3. Start the Go backend server
4. Start the Next.js frontend
5. Place your first AI-powered call!

## Environment Variables

### Backend

```
DIAL_DB_URL=postgresql://...
DIAL_JWT_SECRET=your-secret
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your-key
LIVEKIT_API_SECRET=your-secret
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
```

### Agent

```
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your-key
LIVEKIT_API_SECRET=your-secret
OPENAI_API_KEY=your-key (optional)
```

## API Endpoints

### LiveKit

- `GET /livekit/token` - Generate access token for joining rooms
- `POST /livekit/rooms/create` - Create a room
- `GET /livekit/rooms` - List all rooms
- `POST /livekit/calls/outbound` - Place an outbound call with AI agent

### Phone Numbers

- `GET /phone-numbers` - List authenticated user's phone numbers (from JWT session)
- `GET /phone-numbers/{id}` - Get phone number details
- `POST /phone-numbers` - Create a phone number record
- `POST /phone-numbers/{id}/phone-number` - Update phone number
- `POST /phone-numbers/{id}/friendly-name` - Update friendly name
- `POST /phone-numbers/{id}/capabilities` - Update capabilities
- `POST /phone-numbers/{id}/forwarding` - Update forwarding number
- `POST /phone-numbers/{id}/status` - Update status
- `POST /phone-numbers/{id}/release` - Release phone number
- `POST /twilio/numbers/buy` - Purchase a number from Twilio

## Support

For issues or questions, please check the relevant documentation file or create an issue in the repository.
