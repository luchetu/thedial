"use client";

import { useEffect, useRef, useState } from "react";
import { Room, RoomEvent, RemoteParticipant } from "livekit-client";
import { useLiveKitToken } from "@/features/livekit/hooks/useLiveKitToken";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff } from "lucide-react";

interface CallInterfaceProps {
  roomName: string;
  identity: string;
  onDisconnect?: () => void;
}

export function CallInterface({ roomName, identity, onDisconnect }: CallInterfaceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const roomRef = useRef<Room | null>(null);

  const { data: tokenData, isLoading } = useLiveKitToken(roomName, identity);

  useEffect(() => {
    if (!tokenData || isLoading) return;

    const connectToRoom = async () => {
      const { Room } = await import("livekit-client");
      const room = new Room();
      roomRef.current = room;

      // Set up event listeners
      room.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log("Participant connected:", participant.identity);
        setParticipants((prev) => [...prev, participant]);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log("Participant disconnected:", participant.identity);
        setParticipants((prev) => prev.filter((p) => p !== participant));
      });

      room.on(RoomEvent.Connected, () => {
        console.log("Connected to room:", roomName);
        setIsConnected(true);
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log("Disconnected from room");
        setIsConnected(false);
      });

      try {
        await room.connect(tokenData.url, tokenData.token);
      } catch (error) {
        console.error("Failed to connect to room:", error);
      }
    };

    connectToRoom();

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, [tokenData, isLoading, roomName]);

  const toggleMic = async () => {
    if (!roomRef.current) return;

    const localParticipant = roomRef.current.localParticipant;
    if (!localParticipant) return;

    if (isMicEnabled) {
      await localParticipant.setMicrophoneEnabled(false);
      setIsMicEnabled(false);
    } else {
      await localParticipant.setMicrophoneEnabled(true);
      setIsMicEnabled(true);
    }
  };

  const disconnect = async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
    }
    onDisconnect?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">In Call</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {participants.length + 1} participant{participants.length !== 0 ? "s" : ""}
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={toggleMic}
          variant={isMicEnabled ? "default" : "destructive"}
          size="lg"
          className="rounded-full w-16 h-16"
        >
          {isMicEnabled ? (
            <Mic className="h-6 w-6" />
          ) : (
            <MicOff className="h-6 w-6" />
          )}
        </Button>

        <Button
          onClick={disconnect}
          variant="destructive"
          size="lg"
          className="rounded-full w-16 h-16"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        {isConnected ? "Connected" : "Connecting..."}
      </div>
    </div>
  );
}

