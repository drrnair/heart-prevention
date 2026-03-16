import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">(
    "metric",
  );
  const [cholesterolUnit, setCholesterolUnit] = useState<"mg/dL" | "mmol/L">(
    "mg/dL",
  );

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all associated data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm Deletion",
              "Type DELETE to confirm account deletion. This feature will be implemented in a future update.",
            );
          },
        },
      ],
    );
  };

  function SettingsRow({
    icon,
    label,
    value,
    onPress,
    destructive = false,
  }: {
    readonly icon: string;
    readonly label: string;
    readonly value?: string;
    readonly onPress?: () => void;
    readonly destructive?: boolean;
  }) {
    return (
      <Pressable
        onPress={onPress}
        className="flex-row items-center py-4 border-b border-gray-50 active:bg-gray-50"
      >
        <View
          className={`w-9 h-9 rounded-lg items-center justify-center mr-3 ${
            destructive ? "bg-red-100" : "bg-surface-tertiary"
          }`}
        >
          <Ionicons
            name={icon as any}
            size={18}
            color={destructive ? "#EF4444" : "#6B7280"}
          />
        </View>
        <Text
          className={`flex-1 text-sm ${
            destructive
              ? "text-red-600 font-medium"
              : "text-text-primary"
          }`}
        >
          {label}
        </Text>
        {value && (
          <Text className="text-sm text-text-tertiary mr-2">{value}</Text>
        )}
        {onPress && (
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        )}
      </Pressable>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 pb-8"
      >
        {/* Header */}
        <Text className="text-2xl font-bold text-text-primary mb-6">
          Profile
        </Text>

        {/* User Info Card */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <View className="flex-row items-center">
            <View className="w-14 h-14 bg-primary-100 rounded-full items-center justify-center mr-4">
              <Ionicons name="person" size={28} color="#DC2626" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-text-primary">
                {user?.email ?? "User"}
              </Text>
              <Text className="text-xs text-text-tertiary mt-0.5">
                Member since{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Info */}
        <View className="bg-white rounded-2xl px-4 shadow-sm mb-4">
          <Text className="text-xs font-semibold text-text-tertiary uppercase tracking-wider pt-4 pb-2">
            Personal Information
          </Text>
          <SettingsRow
            icon="person-outline"
            label="Edit Demographics"
            onPress={() => router.push("/(onboarding)/demographics")}
          />
          <SettingsRow
            icon="body-outline"
            label="Edit Measurements"
            onPress={() => router.push("/(onboarding)/measurements")}
          />
          <SettingsRow
            icon="medkit-outline"
            label="Edit Medical History"
            onPress={() => router.push("/(onboarding)/medical-history")}
          />
          <SettingsRow
            icon="restaurant-outline"
            label="Edit Preferences"
            onPress={() => router.push("/(onboarding)/preferences")}
          />
        </View>

        {/* Units */}
        <View className="bg-white rounded-2xl px-4 shadow-sm mb-4">
          <Text className="text-xs font-semibold text-text-tertiary uppercase tracking-wider pt-4 pb-2">
            Units & Display
          </Text>
          <View className="py-4 border-b border-gray-50">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-text-primary">
                Measurement System
              </Text>
            </View>
            <View className="flex-row bg-surface-tertiary rounded-lg p-0.5">
              <Pressable
                onPress={() => setUnitSystem("metric")}
                className={`flex-1 py-2 rounded-md items-center ${
                  unitSystem === "metric" ? "bg-white shadow-sm" : ""
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    unitSystem === "metric"
                      ? "text-primary-600"
                      : "text-text-secondary"
                  }`}
                >
                  Metric (cm, kg)
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setUnitSystem("imperial")}
                className={`flex-1 py-2 rounded-md items-center ${
                  unitSystem === "imperial" ? "bg-white shadow-sm" : ""
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    unitSystem === "imperial"
                      ? "text-primary-600"
                      : "text-text-secondary"
                  }`}
                >
                  Imperial (ft, lbs)
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="py-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-text-primary">
                Cholesterol Units
              </Text>
            </View>
            <View className="flex-row bg-surface-tertiary rounded-lg p-0.5">
              <Pressable
                onPress={() => setCholesterolUnit("mg/dL")}
                className={`flex-1 py-2 rounded-md items-center ${
                  cholesterolUnit === "mg/dL" ? "bg-white shadow-sm" : ""
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    cholesterolUnit === "mg/dL"
                      ? "text-primary-600"
                      : "text-text-secondary"
                  }`}
                >
                  mg/dL
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setCholesterolUnit("mmol/L")}
                className={`flex-1 py-2 rounded-md items-center ${
                  cholesterolUnit === "mmol/L" ? "bg-white shadow-sm" : ""
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    cholesterolUnit === "mmol/L"
                      ? "text-primary-600"
                      : "text-text-secondary"
                  }`}
                >
                  mmol/L
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Subscription */}
        <View className="bg-white rounded-2xl px-4 shadow-sm mb-4">
          <Text className="text-xs font-semibold text-text-tertiary uppercase tracking-wider pt-4 pb-2">
            Subscription
          </Text>
          <SettingsRow
            icon="diamond-outline"
            label="Subscription Status"
            value="Free"
            onPress={() =>
              Alert.alert(
                "Upgrade",
                "Premium subscription plans will be available in a future update.",
              )
            }
          />
        </View>

        {/* Account Actions */}
        <View className="bg-white rounded-2xl px-4 shadow-sm mb-4">
          <Text className="text-xs font-semibold text-text-tertiary uppercase tracking-wider pt-4 pb-2">
            Account
          </Text>
          <SettingsRow
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleSignOut}
          />
          <SettingsRow
            icon="trash-outline"
            label="Delete Account"
            onPress={handleDeleteAccount}
            destructive
          />
        </View>

        {/* App Version */}
        <View className="items-center mt-4">
          <Text className="text-xs text-text-tertiary">
            HeartPrevention v1.0.0
          </Text>
          <Text className="text-2xs text-text-tertiary mt-1">
            Wellness app - not a medical device
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
