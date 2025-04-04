import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, MessageCircle, PhoneCall, Video } from "lucide-react";
import { Link } from "wouter";
import Chat from "./Chat";

interface VideoCallFallbackProps {
  doctorId?: number;
  onTryVideoCall: () => void;
  onEndCall?: () => void;
}

export default function VideoCallFallback({ doctorId, onTryVideoCall, onEndCall }: VideoCallFallbackProps) {
  const [showChat, setShowChat] = useState(false);

  if (showChat && doctorId) {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-muted p-2 flex items-center justify-between rounded-t-md">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowChat(false)}
          >
            Back to Options
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEndCall}
          >
            End Session
          </Button>
        </div>
        <div className="flex-1">
          <Chat receiverId={doctorId} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="bg-amber-50 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Video Call Unavailable</CardTitle>
          </div>
          <CardDescription>
            We're having trouble connecting your video call. Please try one of these alternatives:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-4">
            <Button
              className="w-full justify-start" 
              onClick={onTryVideoCall}
              variant="outline"
            >
              <Video className="mr-2 h-4 w-4 text-primary-500" />
              Try Video Call Again
            </Button>
            
            <Button 
              className="w-full justify-start" 
              onClick={() => setShowChat(true)}
              variant="outline"
            >
              <MessageCircle className="mr-2 h-4 w-4 text-primary-500" />
              Text Chat with Doctor
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              asChild
            >
              <Link href="/consultations?tab=upcoming">
                <PhoneCall className="mr-2 h-4 w-4 text-primary-500" />
                Schedule for Later
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t px-6 py-4">
          <p className="text-xs text-gray-500">
            If you're experiencing a medical emergency, please call emergency services immediately at <span className="font-bold">108</span> or visit your nearest hospital.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}