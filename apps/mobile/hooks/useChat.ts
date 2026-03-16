import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

interface ChatMessage {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly createdAt: string;
}

interface ChatResponseEnvelope {
  readonly success: boolean;
  readonly data: {
    readonly conversationId: string;
    readonly message: string;
    readonly remainingQueries: number;
  };
  readonly error: string | null;
  readonly disclaimer: string | null;
}

interface UseChatReturn {
  readonly messages: readonly ChatMessage[];
  readonly sendMessage: (content: string) => Promise<void>;
  readonly conversationId: string | null;
  readonly remainingQueries: number | null;
  readonly isLoading: boolean;
  readonly isSending: boolean;
  readonly error: string | null;
  readonly isPremiumRequired: boolean;
  readonly isDailyLimitReached: boolean;
  readonly startNewConversation: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat(): UseChatReturn {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [remainingQueries, setRemainingQueries] = useState<number | null>(null);
  const [isLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPremiumRequired, setIsPremiumRequired] = useState(false);
  const [isDailyLimitReached, setIsDailyLimitReached] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!isAuthenticated || isSending) return;

      setIsSending(true);
      setError(null);
      setIsPremiumRequired(false);
      setIsDailyLimitReached(false);

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      const response = await api.post<ChatResponseEnvelope>("/api/chat", {
        message: content,
        conversationId,
      });

      if (response.error) {
        if (response.status === 403) {
          setIsPremiumRequired(true);
        } else if (response.status === 429) {
          setIsDailyLimitReached(true);
        }
        setError(response.error);
        setIsSending(false);
        return;
      }

      const payload = response.data?.data;

      if (payload) {
        setConversationId(payload.conversationId);
        setRemainingQueries(payload.remainingQueries);

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: payload.message,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }

      setIsSending(false);
    },
    [isAuthenticated, isSending, conversationId],
  );

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setRemainingQueries(null);
    setError(null);
    setIsPremiumRequired(false);
    setIsDailyLimitReached(false);
  }, []);

  return {
    messages,
    sendMessage,
    conversationId,
    remainingQueries,
    isLoading,
    isSending,
    error,
    isPremiumRequired,
    isDailyLimitReached,
    startNewConversation,
  };
}

export type { ChatMessage };
