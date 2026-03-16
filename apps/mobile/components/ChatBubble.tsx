import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatBubbleProps {
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly timestamp?: string;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <View className={`flex-row mb-3 ${isUser ? "justify-end" : "justify-start"}`} accessibilityLabel={`${role === 'user' ? 'You' : 'Assistant'}: ${content}`}>
      {!isUser && (
        <View className="w-7 h-7 rounded-full bg-red-50 items-center justify-center mr-2 mt-1">
          <Ionicons name="heart" size={14} color="#EF4444" />
        </View>
      )}
      <View className="max-w-[75%]">
        <View
          className={`px-4 py-3 ${
            isUser
              ? "bg-red-500 rounded-l-2xl rounded-tr-2xl"
              : "bg-gray-100 rounded-r-2xl rounded-tl-2xl"
          }`}
        >
          <Text
            className={`text-sm leading-5 ${
              isUser ? "text-white" : "text-gray-900"
            }`}
          >
            {content}
          </Text>
        </View>
        {timestamp && (
          <Text
            className={`text-2xs text-gray-400 mt-1 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {formatTimestamp(timestamp)}
          </Text>
        )}
      </View>
    </View>
  );
}
