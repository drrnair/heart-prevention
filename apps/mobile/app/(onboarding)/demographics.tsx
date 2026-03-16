import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ETHNICITIES = [
  "White / Caucasian",
  "Black / African American",
  "South Asian",
  "East Asian",
  "Hispanic / Latino",
  "Southeast Asian",
  "Middle Eastern / North African",
  "Native American / Alaska Native",
  "Pacific Islander / Native Hawaiian",
  "Mixed / Other",
] as const;

const SCORE2_REGIONS = [
  "Low risk (e.g., Belgium, Denmark, France, Spain)",
  "Moderate risk (e.g., Germany, Italy, Portugal, Greece)",
  "High risk (e.g., Poland, Lithuania, Hungary, Czech Republic)",
  "Very high risk (e.g., Russia, Ukraine, Romania, Serbia)",
  "Not applicable",
] as const;

export default function DemographicsScreen() {
  const router = useRouter();

  const [dateOfBirthText, setDateOfBirthText] = useState("");
  const [biologicalSex, setBiologicalSex] = useState<"male" | "female" | null>(
    null,
  );
  const [ethnicity, setEthnicity] = useState<string | null>(null);
  const [showEthnicityPicker, setShowEthnicityPicker] = useState(false);
  const [score2Region, setScore2Region] = useState<string | null>(null);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const handleNext = () => {
    router.push("/(onboarding)/measurements");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Indicator */}
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <View className="flex-1 flex-row gap-2">
            <View className="flex-1 h-1.5 rounded-full bg-primary-600" />
            <View className="flex-1 h-1.5 rounded-full bg-gray-200" />
            <View className="flex-1 h-1.5 rounded-full bg-gray-200" />
            <View className="flex-1 h-1.5 rounded-full bg-gray-200" />
          </View>
          <Text className="ml-3 text-xs text-text-tertiary">1 of 4</Text>
        </View>

        {/* Header */}
        <Text className="text-2xl font-bold text-text-primary mb-2">
          About You
        </Text>
        <Text className="text-sm text-text-secondary mb-8">
          Basic demographics help us select the right risk calculator for your
          profile.
        </Text>

        {/* Date of Birth */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-text-primary mb-2">
            Date of Birth
          </Text>
          <View className="flex-row items-center bg-surface-secondary border border-gray-200 rounded-xl px-4 h-12">
            <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-text-primary"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={dateOfBirthText}
              onChangeText={setDateOfBirthText}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              maxLength={10}
            />
          </View>
          <Text className="text-xs text-text-tertiary mt-1">
            Format: YYYY-MM-DD (e.g., 1980-06-15)
          </Text>
        </View>

        {/* Biological Sex */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-text-primary mb-2">
            Biological Sex
          </Text>
          <Text className="text-xs text-text-tertiary mb-3">
            Required for accurate risk scoring algorithms
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setBiologicalSex("male")}
              className={`flex-1 h-12 rounded-xl items-center justify-center border-2 ${
                biologicalSex === "male"
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 bg-surface-secondary"
              }`}
            >
              <Text
                className={`text-base font-medium ${
                  biologicalSex === "male"
                    ? "text-primary-600"
                    : "text-text-secondary"
                }`}
              >
                Male
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setBiologicalSex("female")}
              className={`flex-1 h-12 rounded-xl items-center justify-center border-2 ${
                biologicalSex === "female"
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 bg-surface-secondary"
              }`}
            >
              <Text
                className={`text-base font-medium ${
                  biologicalSex === "female"
                    ? "text-primary-600"
                    : "text-text-secondary"
                }`}
              >
                Female
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Ethnicity */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-text-primary mb-2">
            Ethnicity
          </Text>
          <Pressable
            onPress={() => setShowEthnicityPicker((prev) => !prev)}
            className="flex-row items-center justify-between bg-surface-secondary border border-gray-200 rounded-xl px-4 h-12"
          >
            <Text
              className={`text-base ${
                ethnicity ? "text-text-primary" : "text-text-tertiary"
              }`}
            >
              {ethnicity ?? "Select ethnicity"}
            </Text>
            <Ionicons
              name={showEthnicityPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color="#9CA3AF"
            />
          </Pressable>
          {showEthnicityPicker && (
            <View className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
              {ETHNICITIES.map((eth) => (
                <Pressable
                  key={eth}
                  onPress={() => {
                    setEthnicity(eth);
                    setShowEthnicityPicker(false);
                  }}
                  className={`px-4 py-3 border-b border-gray-100 ${
                    ethnicity === eth ? "bg-primary-50" : "bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      ethnicity === eth
                        ? "text-primary-600 font-medium"
                        : "text-text-primary"
                    }`}
                  >
                    {eth}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* SCORE2 Region */}
        <View className="mb-8">
          <Text className="text-sm font-medium text-text-primary mb-2">
            SCORE2 Region
          </Text>
          <Text className="text-xs text-text-tertiary mb-3">
            For European cardiovascular risk calculation
          </Text>
          <Pressable
            onPress={() => setShowRegionPicker((prev) => !prev)}
            className="flex-row items-center justify-between bg-surface-secondary border border-gray-200 rounded-xl px-4 h-12"
          >
            <Text
              className={`text-base flex-1 ${
                score2Region ? "text-text-primary" : "text-text-tertiary"
              }`}
              numberOfLines={1}
            >
              {score2Region ?? "Select region (if applicable)"}
            </Text>
            <Ionicons
              name={showRegionPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color="#9CA3AF"
            />
          </Pressable>
          {showRegionPicker && (
            <View className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
              {SCORE2_REGIONS.map((region) => (
                <Pressable
                  key={region}
                  onPress={() => {
                    setScore2Region(region);
                    setShowRegionPicker(false);
                  }}
                  className={`px-4 py-3 border-b border-gray-100 ${
                    score2Region === region ? "bg-primary-50" : "bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      score2Region === region
                        ? "text-primary-600 font-medium"
                        : "text-text-primary"
                    }`}
                  >
                    {region}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Next Button */}
        <Pressable
          onPress={handleNext}
          className="bg-primary-600 h-12 rounded-xl items-center justify-center active:bg-primary-700"
        >
          <Text className="text-white text-base font-semibold">Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
