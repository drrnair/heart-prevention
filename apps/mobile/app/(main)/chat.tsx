import React, { useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ChatBubble } from "@/components/ChatBubble";
import { PremiumGate } from "@/components/PremiumGate";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { useChat } from "@/hooks/useChat";

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ conversationId?: string }>();
  const {
    messages,
    sendMessage,
    remainingQueries,
    isSending,
    error,
    isDailyLimitReached,
    startNewConversation,
  } = useChat();

  const [inputText, setInputText] = useState("");
  const listRef = useRef<FlatList>(null);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isSending || isDailyLimitReached) return;
    setInputText("");
    await sendMessage(trimmed);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <PremiumGate
        featureName="AI Wellness Chat"
        featureDescription="Ask questions about heart health, supplements, and wellness"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={0}
        >
          <View className="flex-row items-center px-4 pt-4 pb-2">
            <Pressable onPress={() => router.back()} className="mr-3" accessibilityRole="button" accessibilityLabel="Go back" style={{ minHeight: 44, minWidth: 44 }}>
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </Pressable>
            <Text className="text-xl font-bold text-text-primary flex-1">
              Wellness Chat
            </Text>
            {remainingQueries !== null && (
              <View className="bg-gray-100 rounded-full px-2.5 py-1 mr-2" accessibilityLabel={`${remainingQueries} of 5 queries remaining`}>
                <Text className="text-xs font-medium text-gray-600">
                  {remainingQueries}/5
                </Text>
              </View>
            )}
            <Pressable onPress={startNewConversation} className="mr-2" accessibilityRole="button" accessibilityLabel="New chat" style={{ minHeight: 44, minWidth: 44 }}>
              <Ionicons name="add-circle-outline" size={24} color="#DC2626" />
            </Pressable>
            <Pressable onPress={() => router.push("/(main)/chat-history")} accessibilityRole="button" accessibilityLabel="Chat history" style={{ minHeight: 44, minWidth: 44 }}>
              <Ionicons name="time-outline" size={24} color="#111827" />
            </Pressable>
          </View>

          <DisclaimerBanner disclaimerKey="chat" />

          {error && (
            <View className="mx-4 mt-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <Text className="text-sm text-red-700">{error}</Text>
            </View>
          )}

          {isDailyLimitReached && (
            <View className="mx-4 mt-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <Text className="text-sm text-yellow-800">
                You've used all 5 queries for today. Try again tomorrow.
              </Text>
            </View>
          )}

          <FlatList
            ref={listRef}
            data={[...messages].reverse()}
            keyExtractor={(item) => item.id}
            inverted
            renderItem={({ item }) => (
              <ChatBubble
                role={item.role}
                content={item.content}
                timestamp={item.createdAt}
              />
            )}
            contentContainerClassName="px-4 py-4"
            ListEmptyComponent={
              <View className="items-center py-12">
                <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
                  <Ionicons name="chatbubble-ellipses" size={28} color="#DC2626" />
                </View>
                <Text className="text-base text-gray-400 text-center">
                  Ask me anything about heart health and wellness
                </Text>
              </View>
            }
          />

          {isSending && (
            <View className="px-4 pb-2 flex-row items-center gap-2">
              <View className="w-7 h-7 rounded-full bg-red-50 items-center justify-center">
                <Ionicons name="heart" size={14} color="#EF4444" />
              </View>
              <ActivityIndicator size="small" color="#DC2626" />
            </View>
          )}

          <View className="flex-row items-center px-4 py-3 border-t border-gray-100 bg-white">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={
                isDailyLimitReached
                  ? "Daily limit reached"
                  : "Ask about heart health..."
              }
              editable={!isDailyLimitReached}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm mr-3"
              multiline
              maxLength={500}
              accessibilityLabel="Message input"
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim() || isSending || isDailyLimitReached}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                !inputText.trim() || isSending || isDailyLimitReached
                  ? "bg-gray-200"
                  : "bg-red-500"
              }`}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Ionicons
                name="send"
                size={18}
                color={
                  !inputText.trim() || isSending || isDailyLimitReached
                    ? "#9CA3AF"
                    : "#FFFFFF"
                }
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </PremiumGate>
    </SafeAreaView>
  );
}
