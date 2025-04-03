import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { createPeerConnection, setupWebSocket } from "@/lib/utils";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";

interface VideoCallProps {
  doctorId?: number;
  onEndCall?: () => void;
}

export default function VideoCall({ doctorId, onEndCall }: VideoCallProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCallInitiator, setIsCallInitiator] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Setup WebSocket connection if user is logged in
    if (user) {
      const socket = setupWebSocket(user.id, handleWebSocketMessage);
      webSocketRef.current = socket;

      return () => {
        socket.close();
      };
    }
  }, [user]);

  useEffect(() => {
    // Auto-start call if doctor ID is provided
    if (doctorId && user) {
      startCall();
    }
  }, [doctorId, user]);

  const handleWebSocketMessage = async (data: any) => {
    if (!peerConnectionRef.current) {
      // Initialize peer connection if we get a message but don't have one yet
      peerConnectionRef.current = createPeerConnection();
      await setupMediaDevices();
    }

    if (data.type === 'video_offer') {
      // Someone is calling us
      toast({
        title: "Incoming call",
        description: `Call from ${data.fromUserName || 'Unknown'}`,
      });

      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );
        
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
          webSocketRef.current.send(JSON.stringify({
            type: 'video_answer',
            answer,
            targetUserId: data.fromUserId,
            fromUserId: user?.id,
            fromUserName: user?.fullName
          }));
        }
        
        setIsCallActive(true);
      } catch (error) {
        console.error("Error handling video offer:", error);
        toast({
          title: "Call failed",
          description: "Failed to establish connection",
          variant: "destructive",
        });
      }
    } 
    else if (data.type === 'video_answer') {
      // Our call was answered
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        setIsConnecting(false);
        setIsCallActive(true);
      } catch (error) {
        console.error("Error handling video answer:", error);
        setIsConnecting(false);
        toast({
          title: "Call failed",
          description: "Failed to connect call",
          variant: "destructive",
        });
      }
    } 
    else if (data.type === 'ice_candidate') {
      try {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }
  };

  const setupMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        if (peerConnectionRef.current && localStreamRef.current) {
          peerConnectionRef.current.addTrack(track, localStreamRef.current);
        }
      });
      
      // Setup event handlers for the peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
        
        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate && webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            webSocketRef.current.send(JSON.stringify({
              type: 'ice_candidate',
              candidate: event.candidate,
              targetUserId: doctorId || null
            }));
          }
        };
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Media access error",
        description: "Could not access camera or microphone",
        variant: "destructive",
      });
    }
  };

  const startCall = async () => {
    if (!user || !doctorId) {
      toast({
        title: "Call error",
        description: "Missing user info or doctor ID",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnecting(true);
    setIsCallInitiator(true);
    
    try {
      peerConnectionRef.current = createPeerConnection();
      await setupMediaDevices();
      
      // Create offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      // Send offer via WebSocket
      if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        webSocketRef.current.send(JSON.stringify({
          type: 'video_offer',
          offer,
          targetUserId: doctorId,
          fromUserId: user.id,
          fromUserName: user.fullName
        }));
        
        toast({
          title: "Calling...",
          description: "Waiting for the doctor to answer",
        });
      } else {
        throw new Error("WebSocket not connected");
      }
    } catch (error) {
      console.error("Error starting call:", error);
      setIsConnecting(false);
      toast({
        title: "Call failed",
        description: "Failed to initiate call",
        variant: "destructive",
      });
    }
  };

  const endCall = () => {
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    setIsCallActive(false);
    setIsConnecting(false);
    
    if (onEndCall) {
      onEndCall();
    }
    
    toast({
      title: "Call ended",
      description: "The call has been disconnected",
    });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative">
        {/* Remote video (full container) */}
        <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {!isCallActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 text-white">
              {isConnecting ? (
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Connecting...</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-4">{doctorId ? "Ready to call doctor" : "Waiting for call"}</p>
                  {doctorId && !isCallActive && !isConnecting && (
                    <Button onClick={startCall}>Start Call</Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Local video (small overlay) */}
        <div className="absolute bottom-4 right-4 w-1/4 max-w-[180px] rounded-lg overflow-hidden shadow-lg border-2 border-white">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* Call controls */}
      <div className="mt-4 flex justify-center space-x-4">
        <Button
          size="icon"
          variant={isMuted ? "destructive" : "secondary"}
          onClick={toggleMute}
          className="rounded-full h-12 w-12"
        >
          {isMuted ? <MicOff /> : <Mic />}
        </Button>
        
        <Button
          size="icon"
          variant="destructive"
          onClick={endCall}
          className="rounded-full h-12 w-12"
        >
          <PhoneOff />
        </Button>
        
        <Button
          size="icon"
          variant={isVideoEnabled ? "secondary" : "destructive"}
          onClick={toggleVideo}
          className="rounded-full h-12 w-12"
        >
          {isVideoEnabled ? <Video /> : <VideoOff />}
        </Button>
      </div>
    </div>
  );
}
