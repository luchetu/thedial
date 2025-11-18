"use client";

import { useCallback, useMemo } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { DisconnectReason } from "livekit-client";
import { deleteRoom } from "@/features/livekit/api";
import { useLiveKitToken } from "@/features/livekit/hooks/useLiveKitToken";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CallInterfaceContent } from "./CallInterfaceContent";

interface CallInterfaceProps {
  roomName: string;
  identity: string;
  callerName?: string;
  callerNumber?: string;
  onDisconnect?: () => void;
}

export function CallInterface({ roomName, identity, callerName, callerNumber, onDisconnect }: CallInterfaceProps) {

  const { data: tokenData, isLoading } = useLiveKitToken(roomName, identity);
  const token = tokenData?.token;
  const serverUrl = tokenData?.url;

  // Memoize LiveKitRoom options to prevent unnecessary re-renders
  // Disable automatic reconnection - user will retry manually
  const roomOptions = useMemo(() => ({
    // Don't auto-publish tracks - we'll handle it manually after connection
    publishDefaults: {
      videoSimulcastLayers: [],
    },
    // Disable automatic reconnection
    disconnectOnPageLeave: false,
    // Stop reconnection attempts
    adaptiveStream: false,
  }), []);

  // Memoize the disconnect handler to prevent recreating it on every render
  // No retries - close modal on any disconnect, user can retry manually
  const handleDisconnected = useCallback(async (reason?: DisconnectReason) => {
    console.log("LiveKitRoom disconnected, reason:", reason);
    
    // DisconnectReason.CLIENT_INITIATED = 1 (user clicked disconnect)
    // DisconnectReason.SERVER_SHUTDOWN = 2 (room was deleted by server/backend)
    // Other values are connection errors
    
    const isUserInitiated = reason === DisconnectReason.CLIENT_INITIATED;
    
    if (isUserInitiated) {
      // User manually disconnected - delete room to end SIP call
      console.log("User-initiated disconnect - deleting room");
      try {
        await deleteRoom(roomName);
        console.log("Room deleted successfully after user disconnect");
      } catch (error) {
        console.error("Failed to delete room after disconnect:", error);
      }
    } else {
      // Any other disconnect (connection error, server shutdown, etc.)
      // Delete room and close modal - user can retry manually
      console.log(`Disconnect reason ${reason} - closing call interface, user can retry manually`);
      try {
        await deleteRoom(roomName);
        console.log("Room deleted after disconnect");
      } catch (error) {
        console.error("Failed to delete room after disconnect:", error);
      }
    }
    
    // Always close the modal on disconnect (no retries)
    onDisconnect?.();
  }, [roomName, onDisconnect]);

  const handleError = useCallback((error: Error) => {
    console.error("LiveKitRoom error:", error);
    // Don't disconnect on track publication errors - those are expected during connection
    if (error.message && error.message.includes("publication of local track timed out")) {
      console.log("Track publication timeout - this is normal during initial connection");
      return;
    }
  }, []);

  return (
    <Dialog open={true} onOpenChange={(open) => {
      console.log("🔵 Dialog onOpenChange:", open);
      if (!open) {
        // Disconnect will be handled by the inner component
      }
    }}>
      <DialogContent 
        className="sm:max-w-md bg-linear-to-b from-gray-900 to-gray-800 border-gray-700 text-white z-9999"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Call Interface</DialogTitle>
        <DialogDescription className="sr-only">Active call interface</DialogDescription>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="ml-4 text-white">Loading...</p>
          </div>
        ) : (
          <LiveKitRoom
            key={`${roomName}-${identity}`}
            video={false}
            audio={false}
            token={token!}
            serverUrl={serverUrl!}
            connect={true}
            options={roomOptions}
            onDisconnected={handleDisconnected}
            onError={handleError}
          >
            <CallInterfaceContent 
              roomName={roomName}
              callerName={callerName}
              callerNumber={callerNumber}
              onDisconnect={onDisconnect}
            />
          </LiveKitRoom>
        )}
      </DialogContent>
    </Dialog>
  );
}
