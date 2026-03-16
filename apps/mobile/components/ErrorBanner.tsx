import React from "react";
import { View, Text, Pressable } from "react-native";

interface ErrorBannerProps {
  readonly message: string;
  readonly onRetry: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <View className="mx-4 my-4 rounded-xl p-4" style={{ backgroundColor: "#FEE2E2" }} accessibilityRole="alert">
      <Text className="text-sm font-medium mb-2" style={{ color: "#DC2626" }}>
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        className="self-start rounded-lg px-4 py-2 active:opacity-80"
        style={{ backgroundColor: "#DC2626", minHeight: 44 }}
        accessibilityRole="button"
        accessibilityLabel="Retry"
      >
        <Text className="text-sm font-medium text-white">Retry</Text>
      </Pressable>
    </View>
  );
}
