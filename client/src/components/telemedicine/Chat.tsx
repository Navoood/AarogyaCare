import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, timeAgo } from "@/lib/utils";
import { Send } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { setupWebSocket } from "@/lib/utils";

interface ChatProps {
  receiverId: number;
}

export default function Chat({ receiverId }: ChatProps) {
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  // Fetch chat messages
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ["/api/chat-messages", user?.id, receiverId],
    queryFn: async () => {
      const res = await fetch(`/api/chat-messages?senderId=${user?.id}&receiverId=${receiverId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!user && !!receiverId,
  });

  // Fetch receiver user data
  const { data: receiverData, isLoading: isLoadingReceiver } = useQuery({
    queryKey: ["/api/users", receiverId],
    enabled: !!receiverId,
  });

  useEffect(() => {
    // Setup WebSocket connection
    if (user) {
      const socket = setupWebSocket(user.id, handleWebSocketMessage);
      websocketRef.current = socket;

      return () => {
        socket.close();
      };
    }
  }, [user]);

  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'chat') {
      // If we receive a message that's relevant to this chat, update the query cache
      const message = data.message;
      if (
        (message.senderId === user?.id && message.receiverId === receiverId) ||
        (message.senderId === receiverId && message.receiverId === user?.id)
      ) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/chat-messages", user?.id, receiverId] 
        });
      }
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messagesData]);

  const sendMessage = () => {
    if (!message.trim() || !user || !receiverId) return;

    const chatMessage = {
      type: 'chat',
      senderId: user.id,
      receiverId: receiverId,
      content: message.trim()
    };

    // Send via WebSocket
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(chatMessage));
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b">
        {isLoadingReceiver ? (
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-medium">
                {receiverData?.user ? getInitials(receiverData.user.fullName) : "?"}
              </span>
            </div>
            <div className="ml-3">
              <p className="font-medium">{receiverData?.user?.fullName || "Unknown User"}</p>
              <p className="text-xs text-gray-500">
                {receiverData?.user?.role === "doctor" 
                  ? receiverData?.doctor?.specialization || "Doctor" 
                  : "Patient"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chat messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-end">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-20 w-2/3 ml-2 rounded-lg" />
            </div>
            <div className="flex items-end justify-end">
              <Skeleton className="h-20 w-2/3 mr-2 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="flex items-end">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-12 w-1/2 ml-2 rounded-lg" />
            </div>
          </div>
        ) : messagesData?.messages?.length > 0 ? (
          messagesData.messages.map((msg: any) => {
            const isCurrentUser = msg.senderId === user?.id;
            return (
              <div 
                key={msg.id} 
                className={`flex items-end ${isCurrentUser ? 'justify-end' : ''}`}
              >
                {!isCurrentUser && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                    <span className="text-xs text-gray-600 font-medium">
                      {receiverData?.user ? getInitials(receiverData.user.fullName) : "?"}
                    </span>
                  </div>
                )}
                <div 
                  className={`px-4 py-2 rounded-lg max-w-[80%] ${
                    isCurrentUser 
                      ? 'bg-primary-600 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p>{msg.content}</p>
                  <div 
                    className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'}`}
                  >
                    {timeAgo(msg.timestamp)}
                  </div>
                </div>
                {isCurrentUser && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center ml-2">
                    <span className="text-xs text-primary-600 font-medium">
                      {user ? getInitials(user.fullName) : "?"}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="p-4 border-t">
        <div className="flex items-center">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 mr-2"
          />
          <Button size="icon" onClick={sendMessage} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
