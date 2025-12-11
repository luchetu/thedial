"use client";

import { useMemo, useState, useEffect } from "react";
import {
  useConnectionState,
  useRemoteParticipants,
  useRoomContext,
  DisconnectButton,
  TrackToggle,
  useLocalParticipant,
  useMediaDevices,
  RoomAudioRenderer,
  BarVisualizer,
  useTracks
} from "@livekit/components-react";
import { ConnectionState as ConnectionStateEnum, Track, RoomEvent } from "livekit-client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { PhoneOff, Volume2, Mic, Check, Captions } from "lucide-react";
import { NumberSquareNineIcon } from "@phosphor-icons/react/dist/ssr";
import { DtmfKeypad } from "./DtmfKeypad";
import { Transcription } from "./Transcription";
import { cn } from "@/lib/utils";

interface CallInterfaceContentProps {
  roomName: string;
  callerName?: string;
  callerNumber?: string;
  onDisconnect?: () => void;
}

type CallState = "connecting" | "ringing" | "connected" | "disconnected" | "reconnecting";

export function CallInterfaceContent({ roomName: _roomName, callerName, callerNumber, onDisconnect: _onDisconnect }: CallInterfaceContentProps) {
  const connectionState = useConnectionState();
  const room = useRoomContext();

  // Use LiveKit hooks - useRemoteParticipants automatically filters out local participant
  const remoteParticipants = useRemoteParticipants();
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const audioOutputDevices = useMediaDevices({ kind: 'audiooutput' });
  const audioInputDevices = useMediaDevices({ kind: 'audioinput' });

  // DTMF keypad state
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  // Transcript state
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  // Get microphone track reference for visualizer
  const microphonePublication = localParticipant.getTrackPublication(Track.Source.Microphone);
  const micTrackRef = microphonePublication
    ? {
      participant: localParticipant,
      source: Track.Source.Microphone,
      publication: microphonePublication,
    }
    : undefined;

  // Get microphone tracks using useTracks (like LiveKit example)
  const microphoneTracks = useTracks([Track.Source.Microphone], {
    updateOnlyOn: [
      RoomEvent.TrackSubscribed,
      RoomEvent.TrackUnsubscribed,
      RoomEvent.TrackMuted,
      RoomEvent.TrackUnmuted,
    ],
    onlySubscribed: true,
  }).filter((track) => track.participant.isLocal === false);

  // Find SIP participant - simplified like LiveKit example
  // Check identity first (most common pattern), then attributes
  const sipParticipant = remoteParticipants.find((p) => {
    // Primary: Check identity pattern (like LiveKit example)
    if (p.identity.startsWith('sip_')) {
      return true;
    }
    // Fallback: Check for SIP-related attributes
    if (p.attributes) {
      const attributeKeys = Object.keys(p.attributes);
      return attributeKeys.some(key =>
        key.toLowerCase().includes('sip') ||
        key.toLowerCase().includes('call')
      );
    }
    return false;
  });

  // Get SIP call status from participant attributes (like LiveKit example)
  const sipCallStatus = sipParticipant?.attributes?.['sip.callStatus'] as string | undefined;

  // Find the SIP participant's microphone track (like LiveKit example)
  const sipMicrophoneTrack = microphoneTracks.find((trackRef) =>
    trackRef.participant.identity.startsWith('sip_') ||
    trackRef.participant === sipParticipant
  );

  // Track if we've ever had a SIP participant (like LiveKit example)
  // Use state to track this across renders
  const [hasHadSipParticipant, setHasHadSipParticipant] = useState(false);

  // Update state when SIP participant is detected (like LiveKit example)
  // This pattern is used in the LiveKit example - it's valid for tracking derived state
  useEffect(() => {
    if (sipParticipant && (sipCallStatus === 'active' || sipCallStatus === 'ringing' || sipCallStatus === 'dialing')) {
      if (!hasHadSipParticipant) {
        setTimeout(() => setHasHadSipParticipant(true), 0);
      }
    }
  }, [sipParticipant, sipCallStatus, hasHadSipParticipant]);

  // Debug logging
  useEffect(() => {
    if (sipParticipant) {
      console.log('🔵 [SIP] SIP Participant:', {
        identity: sipParticipant.identity,
        name: sipParticipant.name,
        status: sipCallStatus,
        hasMicrophoneTrack: !!sipMicrophoneTrack,
        allMicTracks: microphoneTracks.map((t) => ({
          identity: t.participant.identity,
          isMuted: t.publication?.isMuted,
          isSubscribed: t.publication?.isSubscribed,
        })),
      });
    }
  }, [sipParticipant, sipCallStatus, sipMicrophoneTrack, microphoneTracks]);

  // Derive call state from SIP status (simplified like LiveKit example)
  // Prioritize SIP call status over connection state
  const callState = useMemo<CallState>(() => {
    // If we have SIP call status, use it directly (like LiveKit example)
    // Check hangup first - if call is hung up, it's disconnected regardless of connection state
    if (sipCallStatus === 'hangup') {
      return "disconnected";
    } else if (sipCallStatus === 'active') {
      // Call is active - show connected even if WebRTC is temporarily disconnected
      return connectionState === ConnectionStateEnum.Connected ? "connected" : "reconnecting";
    } else if (sipCallStatus === 'ringing' || sipCallStatus === 'dialing') {
      return "ringing";
    }

    // No SIP call status yet - check if we have a SIP participant
    if (sipParticipant) {
      // SIP participant exists but no status - assume ringing/connecting
      return connectionState === ConnectionStateEnum.Connected ? "ringing" : "connecting";
    }

    // No SIP participant - check connection state
    if (connectionState === ConnectionStateEnum.Connecting) {
      return "connecting";
    } else if (connectionState === ConnectionStateEnum.Disconnected) {
      // Connection dropped - if we had a SIP participant that's now gone, call is disconnected
      if (hasHadSipParticipant && !sipParticipant) {
        // We had a SIP participant but it's gone - call is disconnected
        return "disconnected";
      }
      // Never had a SIP participant - might be reconnecting or failed
      return "reconnecting";
    } else if (connectionState === ConnectionStateEnum.Connected) {
      // Connected but no SIP participant yet - call is still connecting/ringing
      // With WaitUntilAnswered=false, SIP participant is created immediately but might not join until call starts ringing
      if (hasHadSipParticipant && !sipParticipant) {
        // We've had a SIP participant before but it's gone - call is disconnected
        return "disconnected";
      }
      // Never had a SIP participant - still connecting
      return remoteParticipants.length > 0 ? "ringing" : "connecting";
    }
    return "connecting";
  }, [connectionState, remoteParticipants.length, sipParticipant, sipCallStatus, hasHadSipParticipant]);

  // REMOVED: Timeout logic that was causing premature disconnects
  // The backend handles SIP participant creation and will delete the room if it fails
  // We should not disconnect on the frontend based on timeouts - let the backend and LiveKit handle it
  // If the call is connecting but WebRTC has issues, we show "reconnecting" state instead
  // The backend will delete the room if SIP participant creation fails, which will trigger SERVER_SHUTDOWN disconnect reason

  // Note: Microphone is handled by TrackToggle component
  // No manual setup needed - TrackToggle handles enable/disable automatically

  // Track selected audio output device
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string | null>(null);
  const [selectedInputDevice, setSelectedInputDevice] = useState<string | null>(null);

  // Change audio output device using HTMLAudioElement setSinkId
  // RoomAudioRenderer creates audio elements automatically, we just need to set the sink ID
  const changeAudioDevice = async (deviceId: string) => {
    try {
      // RoomAudioRenderer creates audio elements automatically
      // We just need to set the sink ID on all audio elements
      const audioElements = document.querySelectorAll('audio');
      for (const audioElement of audioElements) {
        if ('setSinkId' in audioElement) {
          try {
            await (audioElement as HTMLAudioElement & { setSinkId: (id: string) => Promise<void> }).setSinkId(deviceId);
          } catch (err) {
            console.warn("Failed to set sink for audio element:", err);
          }
        }
      }
      setSelectedOutputDevice(deviceId);
    } catch (error) {
      console.error("Failed to change audio device:", error);
    }
  };

  // Get device label (handles permission issues)
  const getDeviceLabel = (device: MediaDeviceInfo, isInput: boolean = false) => {
    if (device.label) return device.label;
    if (device.deviceId === 'default') {
      return isInput ? 'Default Microphone' : 'Default Speaker';
    }
    return `${isInput ? 'Microphone' : 'Audio Device'} ${device.deviceId.slice(0, 8)}`;
  };

  // Change microphone input device
  const changeMicrophoneDevice = async (deviceId: string) => {
    if (!room) return;

    try {
      const localParticipant = room.localParticipant;

      // Get current microphone track
      const micTrack = localParticipant.getTrackPublication(Track.Source.Microphone);

      if (micTrack && micTrack.track) {
        // Stop the current track
        await micTrack.track.stop();
        // Unpublish the old track
        await localParticipant.unpublishTrack(micTrack.track);
      }

      // Create new track with the selected device using createTracks
      const tracks = await localParticipant.createTracks({
        audio: {
          deviceId: deviceId,
        },
        video: false,
      });

      // Publish the new audio track
      if (tracks && tracks.length > 0) {
        await localParticipant.publishTrack(tracks[0]);
        setSelectedInputDevice(deviceId);
        console.log("Microphone device changed to:", deviceId);
      }
    } catch (error) {
      console.error("Failed to change microphone device:", error);
    }
  };

  // Note: Manual disconnect is handled by DisconnectButton component
  // Room deletion happens in onDisconnected callback

  // Display call status text (like LiveKit example - prioritize SIP status)
  const getCallStateText = () => {
    // Prioritize SIP call status (like LiveKit example)
    if (sipCallStatus === 'hangup') {
      return "Call ended";
    }
    if (sipCallStatus === 'dialing') {
      return "Dialing...";
    }
    if (sipCallStatus === 'ringing') {
      return "Ringing...";
    }
    if (sipCallStatus === 'active') {
      return "In Call";
    }

    // No SIP status - check if we have a participant before
    if (!sipParticipant && hasHadSipParticipant) {
      return "Participant disconnected";
    }
    if (!sipParticipant && connectionState === ConnectionStateEnum.Connected) {
      return "Dialing...";
    }

    // Fallback to call state
    switch (callState) {
      case "connecting":
        return "Connecting...";
      case "ringing":
        return "Ringing...";
      case "connected":
        return "In Call";
      case "disconnected":
        return "Call Ended";
      case "reconnecting":
        return "Reconnecting...";
      default:
        return "Connecting...";
    }
  };

  const displayName = callerName || callerNumber || "Unknown";

  return (
    <>
      <RoomAudioRenderer />

      <div className="flex h-full w-full relative overflow-hidden">
        {/* Main Call Interface */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-8 transition-all duration-300">

          {/* Profile Picture / Avatar */}
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-linear-to-br from-blue-50 to-indigo-50 border border-white/60 flex items-center justify-center text-3xl font-light text-slate-800 shadow-lg ring-1 ring-white/40">
              {displayName.charAt(0).toUpperCase()}
            </div>
            {callState === "ringing" && (
              <div className="absolute inset-0 rounded-full bg-white/40 animate-ping" />
            )}
          </div>

          {/* Caller Name */}
          <div className="text-center">
            <h2 className="text-3xl font-light text-slate-800 mb-2 drop-shadow-sm tracking-tight">
              {displayName}
            </h2>
            <p className="text-slate-500 font-medium text-lg tracking-wide">
              {callState === "ringing"
                ? "is now calling..."
                : callState === "connecting"
                  ? "Connecting..."
                  : callState === "reconnecting"
                    ? "Reconnecting..."
                    : callState === "connected"
                      ? "In Call"
                      : getCallStateText()
              }
            </p>
            {callerNumber && callerName && (
              <p className="text-slate-400 text-sm mt-1 font-mono opacity-80">{callerNumber}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-6 w-full items-center">
            {/* Primary Controls Row */}
            <div className="flex gap-4 justify-center items-center">

              {/* Transcript Toggle */}
              {(callState === "connected" || callState === "ringing") && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
                  className={cn(
                    "rounded-full w-16 h-16 border-white/40 shadow-lg backdrop-blur-md transition-all duration-300 ring-1 ring-white/30",
                    isTranscriptOpen
                      ? "bg-white/80 text-slate-900 border-white/60 shadow-xl"
                      : "bg-white/20 text-slate-700 hover:bg-white/40 hover:scale-105"
                  )}
                  title="Toggle Transcript"
                >
                  <Captions className="h-6 w-6 stroke-[1.5]" />
                </Button>
              )}

              {/* Microphone button */}
              {(callState === "connected" || callState === "ringing") && (
                <div className="relative flex items-center justify-center">
                  {/* Audio visualizer bars */}
                  {micTrackRef && isMicrophoneEnabled && (
                    <div className="absolute -inset-4 flex items-center justify-center gap-1.5 pointer-events-none z-0">
                      <BarVisualizer
                        barCount={5}
                        trackRef={micTrackRef}
                        options={{ minHeight: 4, maxHeight: 20 }}
                        className="flex h-8 w-auto items-center justify-center gap-1.5"
                      >
                        <span
                          className={cn([
                            'w-1 origin-center rounded-full transition-all',
                            isMicrophoneEnabled ? 'bg-slate-400/80' : 'bg-red-400/80',
                          ])}
                          style={{ minHeight: '4px' }}
                        />
                      </BarVisualizer>
                    </div>
                  )}
                  <div className="relative z-10">
                    <TrackToggle
                      source={Track.Source.Microphone}
                      showIcon={true}
                      className={cn(
                        "rounded-full w-16 h-16 border-white/40 border text-slate-700 flex items-center justify-center transition-all duration-300 shadow-lg backdrop-blur-md ring-1 ring-white/30",
                        isMicrophoneEnabled
                          ? "bg-white/20 hover:bg-white/40 hover:scale-105"
                          : "bg-red-500/20 text-red-600 border-red-200 hover:bg-red-500/30"
                      )}
                      title={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
                    />
                  </div>
                </div>
              )}

              {/* DTMF Keypad button */}
              {(callState === "connected" || callState === "ringing") && (
                <div className="relative">
                  <DtmfKeypad isOpen={isKeypadOpen} onClose={() => setIsKeypadOpen(false)} />
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsKeypadOpen(!isKeypadOpen)}
                    className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/40 text-slate-700 border-white/40 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 ring-1 ring-white/30"
                    title="Toggle DTMF keypad"
                  >
                    <NumberSquareNineIcon weight="bold" className="h-6 w-6 opacity-80" />
                  </Button>
                </div>
              )}

              {/* Disconnect button */}
              <DisconnectButton
                className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 text-white border-none flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                title="End call"
              >
                <PhoneOff className="h-7 w-7" />
              </DisconnectButton>
            </div>

            {/* Device Selectors Row */}
            {callState === "connected" && (audioInputDevices.length > 0 || audioOutputDevices.length > 0) && (
              <div className="flex gap-3 justify-center items-center">
                {/* Microphone device selector */}
                {audioInputDevices.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full bg-white/20 hover:bg-white/30 text-slate-700 border-white/30 h-9 px-4 gap-2 backdrop-blur-sm shadow-sm transition-all"
                        title="Select microphone"
                      >
                        <Mic className="h-3.5 w-3.5 opacity-70" />
                        <span className="text-xs font-medium">Mic</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="center"
                      side="top"
                      className="bg-white/80 backdrop-blur-xl border-white/40 text-slate-800 w-[280px] p-2 shadow-2xl rounded-2xl"
                    >
                      <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Microphone
                      </div>
                      <div className="space-y-1">
                        {audioInputDevices.map((device) => {
                          const isSelected = selectedInputDevice === device.deviceId ||
                            (!selectedInputDevice && device.deviceId === 'default');
                          return (
                            <button
                              key={device.deviceId}
                              onClick={() => {
                                changeMicrophoneDevice(device.deviceId);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between",
                                isSelected
                                  ? "bg-blue-50/80 text-blue-700 font-medium"
                                  : "hover:bg-white/60 text-slate-600"
                              )}
                            >
                              <span className="truncate flex-1">{getDeviceLabel(device, true)}</span>
                              {isSelected && (
                                <Check className="h-3.5 w-3.5 text-blue-500 ml-2 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Audio output device selector */}
                {audioOutputDevices.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full bg-white/20 hover:bg-white/30 text-slate-700 border-white/30 h-9 px-4 gap-2 backdrop-blur-sm shadow-sm transition-all"
                        title="Select audio output"
                      >
                        <Volume2 className="h-3.5 w-3.5 opacity-70" />
                        <span className="text-xs font-medium">Speaker</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="center"
                      side="top"
                      className="bg-white/80 backdrop-blur-xl border-white/40 text-slate-800 w-[280px] p-2 shadow-2xl rounded-2xl"
                    >
                      <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Audio Output
                      </div>
                      <div className="space-y-1">
                        {audioOutputDevices.map((device) => {
                          const isSelected = selectedOutputDevice === device.deviceId ||
                            (!selectedOutputDevice && device.deviceId === 'default');
                          return (
                            <button
                              key={device.deviceId}
                              onClick={() => {
                                changeAudioDevice(device.deviceId);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between",
                                isSelected
                                  ? "bg-blue-50/80 text-blue-700 font-medium"
                                  : "hover:bg-white/60 text-slate-600"
                              )}
                            >
                              <span className="truncate flex-1">{getDeviceLabel(device)}</span>
                              {isSelected && (
                                <Check className="h-3.5 w-3.5 text-blue-500 ml-2 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}
          </div>

          {/* Status Text */}
          {callState !== "connected" && callState !== "ringing" && (
            <div className="text-sm text-gray-400 text-center">
              {getCallStateText()}
            </div>
          )}
        </div>

        {/* Transcript Side Panel */}
        {isTranscriptOpen && (
          <div className="w-80 h-full border-l border-white/10 bg-black/20 backdrop-blur-sm transition-all duration-300 flex-shrink-0">
            <Transcription className="h-full w-full bg-transparent border-none" />
          </div>
        )}
      </div>
    </>
  );
}
