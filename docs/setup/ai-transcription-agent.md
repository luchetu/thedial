# AI Transcription Agent Setup

This guide shows you how to set up the AI transcription agent for telephone calls.

## Overview

The LiveKit telephony integration allows your AI agent to:
- Join phone calls automatically
- Transcribe conversations in real-time
- Provide AI-powered assistance during calls

## Prerequisites

1. LiveKit server running (local or cloud)
2. Python 3.10+ installed
3. LiveKit credentials configured

## Setup Steps

### 1. Install LiveKit Agents Python SDK

```bash
pip install livekit livekit-agents livekit-plugins-openai
```

### 2. Create Your Agent

Create a file `agent.py`:

```python
import asyncio
from livekit import agents, rtc
from livekit.agents import (
    VoiceAssistantAgent,
    JobContext,
    WorkerOptions,
)

async def entrypoint(ctx: JobContext):
    print(f"[{ctx.job.job_id}] agent started")
    
    # Wait for user to join the room
    await ctx.wait_for_participant()
    print(f"[{ctx.job.job_id}] participant connected")
    
    # Create and start the agent
    assistant = VoiceAssistantAgent(
        vad=agents.SileroVAD.load(),
        stt=agents.STTStream(
            providers.DeepgramSTT(
                language="en-US",
            )
        ),
        llm=agents.LLMModel.with_openai_optimized(agents.LLMTypes.GPT_4_O),
        tts=providers.OpenAITTS(voice="alloy"),
    )
    
    assistant.start(ctx)
    
    print(f"[{ctx.job.job_id}] assistant started")
    await assistant.aclose()


if __name__ == "__main__":
    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint,
            # IMPORTANT: Set agent name for explicit dispatch
            agent_name="telephony-agent"
        )
    )
```

### 3. Configure LiveKit Environment

Create a `.env` file:

```bash
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# Optional: OpenAI for transcription
OPENAI_API_KEY=your-openai-key
```

### 4. Start the Agent

```bash
python agent.py dev
```

The agent will:
- Listen for dispatch events from LiveKit
- Join rooms when called via our backend API
- Start transcribing and processing audio automatically

### 5. Test the Integration

1. Start your Go backend server
2. Start the Python agent
3. In the browser, use the "Dial" tab to place a call
4. Watch the agent logs for transcription output

## Agent Behavior

The agent automatically:
1. Joins the room when dispatched by backend
2. Transcribes all audio in real-time
3. Can provide AI assistance based on the conversation
4. Leaves the room when the call ends

## Troubleshooting

**Agent not joining calls:**
- Check that agent name matches: "telephony-agent"
- Verify LiveKit credentials are correct
- Check agent logs for errors

**No transcription:**
- Verify STT provider is configured
- Check audio permissions
- Look for errors in agent output

**Call connection issues:**
- Ensure SIP trunk is configured in LiveKit
- Check that `sipTrunkId` in frontend matches your trunk
- Verify phone number format is correct

## Next Steps

- Add custom prompts for your use case
- Configure voicemail detection
- Implement call transfer functionality
- Add sentiment analysis

See [LiveKit Agent Docs](https://docs.livekit.io/agents/start/telephony.md) for more details.

