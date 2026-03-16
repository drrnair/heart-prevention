import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSubscription } from "@/hooks/useSubscription";

interface PremiumGateProps {
  readonly featureName: string;
  readonly featureDescription: string;
  readonly children: React.ReactNode;
}

export function PremiumGate({
  featureName,
  featureDescription,
  children,
}: PremiumGateProps) {
  const { tier, isLoading } = useSubscription();
  const router = useRouter();

  if (isLoading) return null;

  const hasAccess = tier !== "free" && tier !== null;

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <View className="bg-white border border-gray-200 rounded-2xl p-6 items-center mx-4 my-4" accessibilityLabel={`${featureName} requires premium subscription`}>
      <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name="lock-closed" size={28} color="#6B7280" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {featureName}
      </Text>
      <Text className="text-sm text-gray-500 mb-6 text-center leading-5">
        {featureDescription}
      </Text>
      <Pressable
        onPress={() => router.push("/(main)/paywall")}
        className="bg-red-500 rounded-xl py-3 px-8"
        accessibilityRole="button"
        accessibilityLabel="Upgrade to Premium"
      >
        <Text className="text-white font-semibold text-sm">
          Upgrade to Premium
        </Text>
      </Pressable>
    </View>
  );
}
