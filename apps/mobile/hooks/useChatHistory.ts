import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

interface ConversationSummary {
  readonly conversationId: string;
  readonly firstMessage: string;
  readonly lastActivity: string;
}

interface HistoryMessage {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly created_at: string;
}

interface HistoryListEnvelope {
  readonly success: boolean;
  readonly data: {
    readonly conversations: readonly ConversationSummary[];
  };
  readonly error: string | null;
  readonly disclaimer: string | null;
}

interface ConversationDetailEnvelope {
  readonly success: boolean;
  readonly data: {
    readonly conversationId: string;
    readonly messages: readonly HistoryMessage[];
  };
  readonly error: string | null;
  readonly disclaimer: string | null;
}

interface UseChatHistoryReturn {
  readonly conversations: readonly ConversationSummary[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly loadConversation: (conversationId: string) => Promise<void>;
  readonly currentMessages: readonly HistoryMessage[];
  readonly refetch: () => Promise<void>;
}

export function useChatHistory(): UseChatHistoryReturn {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<
    readonly ConversationSummary[]
  >([]);
  const [currentMessages, setCurrentMessages] = useState<
    readonly HistoryMessage[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response =
      await api.get<HistoryListEnvelope>("/api/chat/history");

    if (response.error) {
      setError(response.error);
    } else {
      setConversations(response.data?.data?.conversations ?? []);
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const loadConversation = useCallback(
    async (conversationId: string) => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      const response = await api.get<ConversationDetailEnvelope>(
        `/api/chat/history?conversationId=${encodeURIComponent(conversationId)}`,
      );

      if (response.error) {
        setError(response.error);
      } else {
        setCurrentMessages(response.data?.data?.messages ?? []);
      }

      setIsLoading(false);
    },
    [isAuthenticated],
  );

  return {
    conversations,
    isLoading,
    error,
    loadConversation,
    currentMessages,
    refetch: fetchHistory,
  };
}

export type { ConversationSummary, HistoryMessage };
