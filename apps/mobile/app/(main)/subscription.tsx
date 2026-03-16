import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSubscription } from "@/hooks/useSubscription";
import { usePurchases } from "@/hooks/usePurchases";

interface FeatureItem {
  readonly label: string;
  readonly freeAccess: boolean;
}

const FEATURES: readonly FeatureItem[] = [
  { label: "Risk Assessment", freeAccess: true },
  { label: "1 Lab Upload / month", freeAccess: true },
  { label: "AI Wellness Chat (5/day)", freeAccess: false },
  { label: "PDF Reports", freeAccess: false },
  { label: "Imaging (CAC/CTCA)", freeAccess: false },
  { label: "Weekly Check-ins", freeAccess: false },
  { label: "Wearable Sync", freeAccess: false },
  { label: "Unlimited Lab Uploads", freeAccess: false },
];

function getTierConfig(tier: string | null) {
  switch (tier) {
    case "premium":
      return { label: "Premium", bgClass: "bg-green-100", textClass: "text-green-700" };
    case "trial":
      return { label: "Trial", bgClass: "bg-blue-100", textClass: "text-blue-700" };
    default:
      return { label: "Free", bgClass: "bg-gray-100", textClass: "text-gray-600" };
  }
}

function getDaysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const { tier, isActive, isLoading } = useSubscription();
  const { restore, isRestoring } = usePurchases();

  const tierConfig = getTierConfig(tier);
  const isPremiumOrTrial = tier === "premium" || tier === "trial";

  const handleManageSubscription = () => {
    const url =
      Platform.OS === "ios"
        ? "https://apps.apple.com/account/subscriptions"
        : "https://play.google.com/store/account/subscriptions";
    Linking.openURL(url);
  };

  const handleRestore = async () => {
    await restore();
  };

  // TODO: Read expiresAt from subscription status endpoint when available
  const expiresAt: string | null = null;
  const daysRemaining = getDaysRemaining(expiresAt);

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 pb-8"
      >
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-white items-center justify-center mr-3 shadow-sm"
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{ minHeight: 44, minWidth: 44 }}
          >
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </Pressable>
          <Text className="text-2xl font-bold text-text-primary">
            Subscription
          </Text>
        </View>

        {/* Tier Badge */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4 items-center">
          <View
            className={`px-6 py-3 rounded-full ${tierConfig.bgClass} mb-3`}
            accessibilityLabel={`Current plan: ${tierConfig.label}`}
          >
            <Text className={`text-lg font-bold ${tierConfig.textClass}`}>
              {tierConfig.label}
            </Text>
          </View>

          {tier === "trial" && daysRemaining !== null && (
            <View className="items-center">
              <Text className="text-sm font-semibold text-blue-700">
                {daysRemaining} days remaining
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                Expires {formatDate(expiresAt)}
              </Text>
            </View>
          )}

          {tier === "premium" && isActive && (
            <Text className="text-xs text-gray-400">
              {expiresAt
                ? `Renews on ${formatDate(expiresAt)}`
                : "Active subscription"}
            </Text>
          )}

          {(!tier || tier === "free") && (
            <Text className="text-xs text-gray-400">
              Upgrade to unlock all features
            </Text>
          )}
        </View>

        {/* Feature List */}
        <View className="bg-white rounded-2xl px-4 shadow-sm mb-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-4 pb-2">
            Features
          </Text>
          {FEATURES.map((feature) => {
            const hasAccess = feature.freeAccess || isPremiumOrTrial;
            return (
              <View
                key={feature.label}
                className="flex-row items-center py-3 border-b border-gray-50"
              >
                <Ionicons
                  name={hasAccess ? "checkmark-circle" : "lock-closed"}
                  size={20}
                  color={hasAccess ? "#22C55E" : "#9CA3AF"}
                />
                <Text
                  className={`ml-3 text-sm ${
                    hasAccess ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {feature.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View className="gap-3">
          {isPremiumOrTrial && (
            <Pressable
              onPress={handleManageSubscription}
              className="bg-white rounded-2xl py-4 items-center shadow-sm active:bg-gray-50"
              accessibilityRole="button"
              accessibilityLabel="Manage subscription"
            >
              <Text className="text-sm font-semibold text-gray-900">
                Manage Subscription
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleRestore}
            disabled={isRestoring}
            className="bg-white rounded-2xl py-4 items-center shadow-sm active:bg-gray-50"
            accessibilityRole="button"
            accessibilityLabel={isRestoring ? "Restoring purchases" : "Restore purchases"}
          >
            <Text className="text-sm font-semibold text-gray-600">
              {isRestoring ? "Restoring..." : "Restore Purchases"}
            </Text>
          </Pressable>

          {(!tier || tier === "free") && (
            <Pressable
              onPress={() => router.push("/(main)/paywall")}
              className="bg-red-600 rounded-2xl py-4 items-center active:bg-red-700"
              accessibilityRole="button"
              accessibilityLabel="Upgrade to Premium"
            >
              <Text className="text-white font-bold text-base">
                Upgrade to Premium
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
