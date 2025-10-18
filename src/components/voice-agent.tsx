"use client";

import { useConversation } from "@elevenlabs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { Orb, type AgentState } from "@/components/ui/orb";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation";
import {
  Message,
  MessageContent,
  MessageAvatar,
} from "@/components/ui/message";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "";

interface MessageType {
  role: "user" | "assistant";
  content: string;
}

export function VoiceAgent() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs agent");
      setAgentState("listening");
      setMessages([
        {
          role: "assistant",
          content: "Hello! I'm here to help you order groceries. What would you like today?",
        },
      ]);
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs agent");
      setAgentState(null);
    },
    onMessage: (message) => {
      console.log("Message received:", message);

      // Update agent state based on message source
      if (message.source === "user") {
        setAgentState("thinking");
      } else {
        setAgentState("talking");
      }

      // Add message to transcript
      if (message.message) {
        setMessages((prev) => [
          ...prev,
          {
            role: message.source === "user" ? "user" : "assistant",
            content: message.message,
          },
        ]);

        // Return to listening after message
        setTimeout(() => setAgentState("listening"), 1000);
      }
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error);
      setAgentState(null);
    },
  });

  const startCall = async () => {
    try {
      await conversation.startSession({ agentId: AGENT_ID });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  const endCall = async () => {
    try {
      await conversation.endSession();
      setMessages([]);
      setAgentState(null);
    } catch (error) {
      console.error("Failed to end conversation:", error);
    }
  };

  const toggleMute = () => {
    if (conversation.isMuted) {
      conversation.unmute();
    } else {
      conversation.mute();
    }
    setIsMuted(!isMuted);
  };

  if (!AGENT_ID) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <p className="text-destructive font-semibold mb-2">Agent Not Configured</p>
        <p className="text-sm text-muted-foreground">
          Please set NEXT_PUBLIC_ELEVENLABS_AGENT_ID in your environment variables.
        </p>
      </div>
    );
  }

  const isCallActive = conversation.status === "connected";

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Orb Visual Indicator */}
      <div className="h-32 w-full flex items-center justify-center bg-gradient-to-b from-muted/50 to-background">
        <div className="w-24 h-24">
          <Orb agentState={agentState} />
        </div>
      </div>

      {/* Conversation Messages */}
      <Conversation className="flex-1 px-2">
        <ConversationContent>
          {messages.length === 0 && !isCallActive ? (
            <ConversationEmptyState
              icon={<Phone className="size-12" />}
              title="Ready to start"
              description="Press the call button to talk with the AI assistant"
            />
          ) : (
            messages.map((msg, index) => (
              <Message key={index} from={msg.role}>
                <MessageAvatar
                  src={msg.role === "user" ? "/avatar-user.png" : "/avatar-ai.png"}
                  name={msg.role === "user" ? "You" : "AI"}
                />
                <MessageContent variant="contained">
                  {msg.content}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Call Controls */}
      <div className="p-3 border-t bg-background">
        {!isCallActive ? (
          <Button
            onClick={startCall}
            className="w-full"
            size="lg"
          >
            <Phone className="mr-2 size-4" />
            Start Call
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={toggleMute}
              variant="outline"
              size="icon"
              className="flex-1"
            >
              {isMuted ? (
                <MicOff className="size-4" />
              ) : (
                <Mic className="size-4" />
              )}
            </Button>
            <Button
              onClick={endCall}
              variant="destructive"
              className="flex-[3]"
            >
              <PhoneOff className="mr-2 size-4" />
              End Call
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
