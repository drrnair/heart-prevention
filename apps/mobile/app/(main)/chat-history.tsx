import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChatHistory } from "@/hooks/useChatHistory";

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

export default function ChatHistoryScreen() {
  const router = useRouter();
  const { conversations, isLoading, error, loadConversation } =
    useChatHistory();

  const handleSelect = async (conversationId: string) => {
    await loadConversation(conversationId);
    router.push({
      pathname: "/(main)/chat",
      params: { conversationId },
    });
  };

  if (isLoading && conversations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-surface-secondary">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="mr-3" accessibilityRole="button" accessibilityLabel="Go back" style={{ minHeight: 44, minWidth: 44 }}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-xl font-bold text-text-primary">
            Chat History
          </Text>
        </View>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <Text className="text-sm text-red-700">{error}</Text>
          </View>
        )}

        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversationId}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelect(item.conversationId)}
              className="bg-white border border-gray-200 rounded-xl p-4 mb-3 active:bg-gray-50"
              accessibilityRole="button"
              accessibilityLabel={`Conversation: ${truncate(item.firstMessage, 80)}, ${formatDate(item.lastActivity)}`}
            >
              <Text className="text-sm font-medium text-gray-900 mb-1">
                {truncate(item.firstMessage, 80)}
              </Text>
              <Text className="text-xs text-gray-400">
                {formatDate(item.lastActivity)}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Ionicons name="chatbubbles-outline" size={40} color="#D1D5DB" />
              <Text className="text-base text-gray-400 mt-3">
                No previous conversations
              </Text>
            </View>
          }
          contentContainerClassName="pb-8"
        />
      </View>
    </SafeAreaView>
  );
}
