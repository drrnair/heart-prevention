import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePurchases } from "@/hooks/usePurchases";
import type { Package } from "@/lib/purchases";

interface FeatureRow {
  readonly label: string;
  readonly free: boolean;
  readonly premium: boolean;
  readonly freeNote?: string;
}

const FEATURES: readonly FeatureRow[] = [
  { label: "Risk Assessment", free: true, premium: true },
  { label: "Lab Upload", free: true, premium: true, freeNote: "1/month" },
  { label: "AI Wellness Chat", free: false, premium: true },
  { label: "PDF Reports", free: false, premium: true },
  { label: "Imaging (CAC/CTCA)", free: false, premium: true },
  { label: "Weekly Check-ins", free: false, premium: true },
  { label: "Wearable Sync", free: false, premium: true },
];

function FeatureIcon({ available }: { readonly available: boolean }) {
  if (available) {
    return <Ionicons name="checkmark-circle" size={20} color="#22C55E" />;
  }
  return <Ionicons name="lock-closed" size={18} color="#9CA3AF" />;
}

export default function PaywallScreen() {
  const router = useRouter();
  const { offerings, purchase, restore, isPurchasing, isRestoring } =
    usePurchases();
  const [selectedPlan, setSelectedPlan] = useState<"ANNUAL" | "MONTHLY">(
    "ANNUAL",
  );

  const monthlyPkg = offerings?.current?.monthly ?? null;
  const annualPkg = offerings?.current?.annual ?? null;

  const selectedPackage: Package | null =
    selectedPlan === "ANNUAL" ? annualPkg : monthlyPkg;

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    const { error } = await purchase(selectedPackage);

    if (error) {
      Alert.alert("Purchase Failed", error);
      return;
    }

    Alert.alert("Welcome to Premium!", "Your subscription is now active.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const handleRestore = async () => {
    const { error } = await restore();

    if (error) {
      Alert.alert("Restore", error);
      return;
    }

    Alert.alert("Restored!", "Your subscription has been restored.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const isProcessing = isPurchasing || isRestoring;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {isProcessing && (
        <View className="absolute inset-0 z-50 bg-black/40 items-center justify-center">
          <View className="bg-white rounded-2xl p-6 items-center">
            <ActivityIndicator size="large" color="#DC2626" />
            <Text className="text-sm text-gray-600 mt-3">
              {isPurchasing ? "Processing purchase..." : "Restoring..."}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-4 pb-8"
        bounces={false}
      >
        {/* Dismiss Button */}
        <View className="flex-row justify-end mb-2">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={{ minHeight: 44, minWidth: 44 }}
          >
            <Ionicons name="close" size={22} color="#6B7280" />
          </Pressable>
        </View>

        {/* Hero */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-4">
            <Ionicons name="heart" size={44} color="#DC2626" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Unlock Your Full{"\n"}Heart Health Journey
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Get unlimited access to all premium features.
          </Text>
        </View>

        {/* Feature Comparison */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6">
          <View className="flex-row mb-3 pb-2 border-b border-gray-200">
            <Text className="flex-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Feature
            </Text>
            <Text className="w-16 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
              Free
            </Text>
            <Text className="w-20 text-xs font-semibold text-red-600 uppercase tracking-wider text-center">
              Premium
            </Text>
          </View>
          {FEATURES.map((feature) => (
            <View
              key={feature.label}
              className="flex-row items-center py-2.5 border-b border-gray-100"
            >
              <Text className="flex-1 text-sm text-gray-800">
                {feature.label}
                {feature.freeNote && feature.free ? (
                  <Text className="text-xs text-gray-400">
                    {" "}
                    ({feature.freeNote})
                  </Text>
                ) : null}
              </Text>
              <View className="w-16 items-center">
                <FeatureIcon available={feature.free} />
              </View>
              <View className="w-20 items-center">
                <FeatureIcon available={feature.premium} />
              </View>
            </View>
          ))}
        </View>

        {/* Pricing Cards */}
        <View className="flex-row gap-3 mb-6">
          {/* Monthly */}
          <Pressable
            onPress={() => setSelectedPlan("MONTHLY")}
            className={`flex-1 rounded-2xl border-2 p-4 items-center ${
              selectedPlan === "MONTHLY"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 bg-white"
            }`}
            accessibilityRole="button"
            accessibilityLabel={`Monthly plan, ${monthlyPkg?.product.priceString ?? "$4.99"} per month`}
            accessibilityState={{ selected: selectedPlan === "MONTHLY" }}
          >
            <Text className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Monthly
            </Text>
            <Text className="text-xl font-bold text-gray-900">
              {monthlyPkg?.product.priceString ?? "$4.99"}
            </Text>
            <Text className="text-xs text-gray-400">/month</Text>
          </Pressable>

          {/* Annual */}
          <Pressable
            onPress={() => setSelectedPlan("ANNUAL")}
            className={`flex-1 rounded-2xl border-2 p-4 items-center ${
              selectedPlan === "ANNUAL"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 bg-white"
            }`}
            accessibilityRole="button"
            accessibilityLabel={`Annual plan, ${annualPkg?.product.priceString ?? "$39.99"} per year, save 33 percent`}
            accessibilityState={{ selected: selectedPlan === "ANNUAL" }}
          >
            <View className="bg-red-500 rounded-full px-2 py-0.5 mb-1">
              <Text className="text-2xs font-bold text-white">Save 33%</Text>
            </View>
            <Text className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Annual
            </Text>
            <Text className="text-xl font-bold text-gray-900">
              {annualPkg?.product.priceString ?? "$39.99"}
            </Text>
            <Text className="text-xs text-gray-400">/year</Text>
          </Pressable>
        </View>

        {/* CTA */}
        <Pressable
          onPress={handlePurchase}
          disabled={isProcessing}
          className="bg-red-600 rounded-2xl py-4 items-center mb-3 active:bg-red-700"
          accessibilityRole="button"
          accessibilityLabel="Start 7-day free trial"
        >
          <Text className="text-white font-bold text-base">
            Start 7-Day Free Trial
          </Text>
        </Pressable>

        {/* Restore */}
        <Pressable
          onPress={handleRestore}
          disabled={isProcessing}
          className="items-center py-2 mb-4"
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
          style={{ minHeight: 44 }}
        >
          <Text className="text-sm text-gray-500 underline">
            Restore Purchases
          </Text>
        </Pressable>

        {/* Fine Print */}
        <Text className="text-xs text-gray-400 text-center leading-4">
          Cancel anytime. No charge during trial.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
