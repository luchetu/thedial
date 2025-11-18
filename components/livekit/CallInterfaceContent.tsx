"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { 
  useConnectionState, 
  useRemoteParticipants,
  useRoomContext, 
  DisconnectButton,
  TrackToggle,
  useLocalParticipant,
  useMediaDevices,
  RoomAudioRenderer
} from "@livekit/components-react";
import { ConnectionState as ConnectionStateEnum, Track } from "livekit-client";
import { deleteRoom } from "@/features/livekit/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { PhoneOff, Volume2, Mic } from "lucide-react";

interface CallInterfaceContentProps {
  roomName: string;
  callerName?: string;
  callerNumber?: string;
  onDisconnect?: () => void;
}

type CallState = "connecting" | "ringing" | "connected" | "disconnected";

export function CallInterfaceContent({ roomName, callerName, callerNumber, onDisconnect }: CallInterfaceContentProps) {
  const connectionState = useConnectionState();
  const room = useRoomContext();
  
  // Use LiveKit hooks - useRemoteParticipants automatically filters out local participant
  const remoteParticipants = useRemoteParticipants();
  const { isMicrophoneEnabled } = useLocalParticipant();
  const audioOutputDevices = useMediaDevices({ kind: 'audiooutput' });
  const audioInputDevices = useMediaDevices({ kind: 'audioinput' });
  
  // Derive call state from connection state and participants
  // No retries - show disconnected state immediately when disconnected
  const callState = useMemo<CallState>(() => {
    if (connectionState === ConnectionStateEnum.Connecting) {
      return "connecting";
    } else if (connectionState === ConnectionStateEnum.Disconnected) {
      // Show disconnected immediately - no retries
      return "disconnected";
    } else if (connectionState === ConnectionStateEnum.Connected) {
      // If connected but no remote participants yet, we're "ringing"
      // Once a participant joins, we're "connected"
      return remoteParticipants.length > 0 ? "connected" : "ringing";
    }
    return "connecting";
  }, [connectionState, remoteParticipants.length]);
  
  const ringingStartTimeRef = useRef<number | null>(null);
  const participantTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to disconnect and delete room
  // According to LiveKit docs, DeleteRoom is recommended for complete call termination
  // This ensures SIP calls end properly and all participants are disconnected
  const disconnectAndCleanup = useCallback(async () => {
    // Disconnect from room first
    if (room) {
      await room.disconnect();
    }
    
    // Delete the room to end the SIP call and disconnect all participants
    try {
      await deleteRoom(roomName);
      console.log("Room deleted successfully");
    } catch (error) {
      console.error("Failed to delete room:", error);
      // Continue with disconnect even if room deletion fails
    }
    
    onDisconnect?.();
  }, [room, roomName, onDisconnect]);

  // Track when ringing starts for timeout logic
  useEffect(() => {
    if (callState === "ringing" && !ringingStartTimeRef.current) {
      ringingStartTimeRef.current = Date.now();
    } else if (callState !== "ringing") {
      // Clear ringing start time when not ringing
      ringingStartTimeRef.current = null;
    }
  }, [callState]);

  // Handle timeout: if no participant joins within 20 seconds while ringing, disconnect
  useEffect(() => {
    if (callState === "ringing" && connectionState === ConnectionStateEnum.Connected) {
      // Set timeout: if no participant joins within 20 seconds, disconnect
      participantTimeoutRef.current = setTimeout(() => {
        // Check current state at timeout execution time (not closure time)
        // Note: We can't use remoteParticipants here due to closure, but room.remoteParticipants is always current
        if (room && room.remoteParticipants.size === 0) {
          console.log("Timeout: No participant joined within 20 seconds. Disconnecting due to likely SIP participant creation failure...");
          disconnectAndCleanup();
        }
      }, 20000); // 20 seconds timeout
      
      return () => {
        if (participantTimeoutRef.current) {
          clearTimeout(participantTimeoutRef.current);
          participantTimeoutRef.current = null;
        }
      };
    } else {
      // Clear timeout when not ringing or when participant joins
      if (participantTimeoutRef.current) {
        clearTimeout(participantTimeoutRef.current);
        participantTimeoutRef.current = null;
      }
    }
  }, [callState, connectionState, room, disconnectAndCleanup]);

  // Additional check: if we're connected and ringing but no participants after 15 seconds, disconnect
  // This catches SIP failures faster than the 20s timeout
  useEffect(() => {
    if (connectionState === ConnectionStateEnum.Connected && 
        callState === "ringing" && 
        remoteParticipants.length === 0 &&
        ringingStartTimeRef.current &&
        Date.now() - ringingStartTimeRef.current > 15000) {
      console.log("No participants joined after 15 seconds - likely SIP failure, disconnecting");
      disconnectAndCleanup();
    }
  }, [connectionState, callState, remoteParticipants.length, disconnectAndCleanup]);

  // Note: Microphone is handled by TrackToggle component
  // No manual setup needed - TrackToggle handles enable/disable automatically

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
        console.log("Microphone device changed to:", deviceId);
      }
    } catch (error) {
      console.error("Failed to change microphone device:", error);
    }
  };

  // Note: Manual disconnect is handled by DisconnectButton component
  // Room deletion happens in onDisconnected callback

  const getCallStateText = () => {
    switch (callState) {
      case "connecting":
        return "Connecting...";
      case "ringing":
        return "Ringing...";
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  const displayName = callerName || callerNumber || "Unknown";

  return (
    <>
      {/* RoomAudioRenderer handles all remote participant audio tracks automatically */}
      <RoomAudioRenderer />
      
      <div className="flex flex-col items-center justify-center space-y-6 p-8">
        {/* Profile Picture / Avatar */}
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-linear-to-b from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
          {displayName.charAt(0).toUpperCase()}
        </div>
        {callState === "ringing" && (
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        )}
      </div>

      {/* Caller Name */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          {displayName}
        </h2>
        <p className="text-gray-300 text-lg">
          {callState === "ringing" 
            ? "is now calling..." 
            : callState === "connecting"
            ? "Connecting..."
            : callState === "connected"
            ? "In Call"
            : getCallStateText()
          }
        </p>
        {callerNumber && callerName && (
          <p className="text-gray-400 text-sm mt-1">{callerNumber}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 w-full justify-center items-center">
        {/* Microphone button - using LiveKit's TrackToggle component */}
        {(callState === "connected" || callState === "ringing") && (
          <TrackToggle
            source={Track.Source.Microphone}
            showIcon={true}
            className="rounded-full w-16 h-16 bg-gray-700 hover:bg-gray-600 text-white border-0 flex items-center justify-center"
            title={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
          />
        )}

        {/* Microphone device selector - show when connected */}
        {callState === "connected" && audioInputDevices.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-16 h-16 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                title="Select microphone"
              >
                <Mic className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              align="center" 
              className="bg-gray-800 border-gray-700 text-white w-[250px] p-2"
            >
              <div className="space-y-1">
                {audioInputDevices.map((device) => (
                  <button
                    key={device.deviceId}
                    onClick={() => {
                      changeMicrophoneDevice(device.deviceId);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-gray-700/50 text-gray-300"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{getDeviceLabel(device, true)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Audio output device selector - show when connected */}
        {/* Note: LiveKit's MediaDeviceMenu is for input devices only, so we use custom Popover for output devices */}
        {callState === "connected" && audioOutputDevices.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-16 h-16 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                title="Select audio output"
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              align="center" 
              className="bg-gray-800 border-gray-700 text-white w-[250px] p-2"
            >
              <div className="space-y-1">
                {audioOutputDevices.map((device) => (
                  <button
                    key={device.deviceId}
                    onClick={() => {
                      changeAudioDevice(device.deviceId);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-gray-700/50 text-gray-300"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{getDeviceLabel(device)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Disconnect button - using LiveKit's DisconnectButton */}
        {/* DisconnectButton automatically calls room.disconnect() */}
        {/* Room deletion is handled in onDisconnected callback */}
        <DisconnectButton
          className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700 text-white border-0 flex items-center justify-center"
          title="End call"
        >
          <PhoneOff className="h-6 w-6" />
        </DisconnectButton>
      </div>

        {/* Status Text */}
        {callState !== "connected" && callState !== "ringing" && (
          <div className="text-sm text-gray-400 text-center">
            {getCallStateText()}
          </div>
        )}
      </div>
    </>
  );
}

