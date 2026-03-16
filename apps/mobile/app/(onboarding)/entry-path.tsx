import React from "react";
import { View, Text, Pressable, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function EntryPathScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-12 pb-8">
        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="heart-circle" size={44} color="#DC2626" />
          </View>
          <Text className="text-2xl font-bold text-text-primary text-center">
            How would you like{"\n"}to get started?
          </Text>
          <Text className="text-sm text-text-secondary mt-3 text-center leading-5">
            Choose the path that best fits where you are right now.
            You can always add more data later.
          </Text>
        </View>

        {/* Card A: Has Reports - goes to demographics first, then upload after onboarding */}
        <Pressable
          onPress={() => router.push("/(onboarding)/demographics")}
          className="bg-white border-2 border-primary-200 rounded-2xl p-5 mb-4 active:bg-primary-50"
        >
          <View className="flex-row items-start gap-4">
            <View className="w-12 h-12 bg-primary-100 rounded-xl items-center justify-center">
              <Ionicons name="document-text" size={24} color="#DC2626" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-text-primary mb-1">
                I have test results
              </Text>
              <Text className="text-sm text-text-secondary leading-5">
                Upload blood test results or imaging reports. We'll extract the
                values and calculate a more precise risk estimate.
              </Text>
              <View className="flex-row items-center mt-3">
                <View className="bg-green-100 rounded-full px-2.5 py-0.5">
                  <Text className="text-2xs font-medium text-green-700">
                    Higher accuracy
                  </Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </Pressable>

        {/* Card B: No Reports */}
        <Pressable
          onPress={() => router.push("/(onboarding)/demographics")}
          className="bg-white border-2 border-blue-200 rounded-2xl p-5 mb-6 active:bg-blue-50"
        >
          <View className="flex-row items-start gap-4">
            <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center">
              <Ionicons name="person" size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-text-primary mb-1">
                I don't have results yet
              </Text>
              <Text className="text-sm text-text-secondary leading-5">
                Answer a few questions about yourself. We'll provide a
                preliminary estimate and recommend which tests to prioritize.
              </Text>
              <View className="flex-row items-center mt-3">
                <View className="bg-amber-100 rounded-full px-2.5 py-0.5">
                  <Text className="text-2xs font-medium text-amber-700">
                    Preliminary estimate
                  </Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </Pressable>

        {/* Info Note */}
        <View className="bg-surface-secondary rounded-xl p-4 mt-auto">
          <View className="flex-row items-start gap-2">
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#6B7280"
            />
            <Text className="flex-1 text-xs text-text-secondary leading-4">
              Your risk estimate improves as you add more data. Start with what
              you have - you can upload reports and add details any time.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
