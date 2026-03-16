import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const CUISINE_OPTIONS = [
  { id: "south_indian", label: "South Indian", icon: "leaf" },
  { id: "north_indian", label: "North Indian", icon: "flame" },
  { id: "mediterranean", label: "Mediterranean", icon: "fish" },
  { id: "western", label: "Western", icon: "restaurant" },
  { id: "east_asian", label: "East Asian", icon: "nutrition" },
  { id: "middle_eastern", label: "Middle Eastern", icon: "cafe" },
] as const;

const ACTIVITY_LEVELS = [
  {
    value: "sedentary",
    label: "Sedentary",
    description: "Little to no regular exercise",
  },
  {
    value: "lightly_active",
    label: "Lightly Active",
    description: "Light exercise 1-3 days/week",
  },
  {
    value: "moderately_active",
    label: "Moderately Active",
    description: "Moderate exercise 3-5 days/week",
  },
  {
    value: "very_active",
    label: "Very Active",
    description: "Hard exercise 6-7 days/week",
  },
] as const;

const EQUIPMENT_OPTIONS = [
  { id: "none", label: "No equipment" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "resistance_bands", label: "Resistance bands" },
  { id: "yoga_mat", label: "Yoga mat" },
  { id: "treadmill", label: "Treadmill" },
  { id: "stationary_bike", label: "Stationary bike" },
  { id: "gym_membership", label: "Full gym access" },
  { id: "swimming_pool", label: "Swimming pool" },
] as const;

export default function PreferencesScreen() {
  const router = useRouter();

  const [selectedCuisines, setSelectedCuisines] = useState<Set<string>>(
    new Set(),
  );
  const [activityLevel, setActivityLevel] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(
    new Set(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCuisine = (id: string) => {
    setSelectedCuisines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleEquipment = (id: string) => {
    setSelectedEquipment((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // In a real app, this would submit to the API and trigger assessment
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.replace("/(main)/dashboard");
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-6 pb-8"
      >
        {/* Progress Indicator */}
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <View className="flex-1 flex-row gap-2">
            <View className="flex-1 h-1.5 rounded-full bg-primary-600" />
            <View className="flex-1 h-1.5 rounded-full bg-primary-600" />
            <View className="flex-1 h-1.5 rounded-full bg-primary-600" />
            <View className="flex-1 h-1.5 rounded-full bg-primary-600" />
          </View>
          <Text className="ml-3 text-xs text-text-tertiary">4 of 4</Text>
        </View>

        {/* Header */}
        <Text className="text-2xl font-bold text-text-primary mb-2">
          Lifestyle Preferences
        </Text>
        <Text className="text-sm text-text-secondary mb-8">
          Help us personalize your nutrition and exercise recommendations.
        </Text>

        {/* Cuisine Preferences */}
        <Text className="text-sm font-medium text-text-primary mb-3">
          Preferred Cuisines
        </Text>
        <Text className="text-xs text-text-tertiary mb-3">
          Select all that apply - we'll tailor meal suggestions accordingly
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {CUISINE_OPTIONS.map((cuisine) => {
            const isSelected = selectedCuisines.has(cuisine.id);
            return (
              <Pressable
                key={cuisine.id}
                onPress={() => toggleCuisine(cuisine.id)}
                className={`flex-row items-center px-4 py-2.5 rounded-xl border-2 ${
                  isSelected
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 bg-surface-secondary"
                }`}
              >
                <Ionicons
                  name={cuisine.icon as any}
                  size={16}
                  color={isSelected ? "#DC2626" : "#9CA3AF"}
                />
                <Text
                  className={`ml-2 text-sm ${
                    isSelected
                      ? "text-primary-600 font-medium"
                      : "text-text-primary"
                  }`}
                >
                  {cuisine.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Activity Level */}
        <Text className="text-sm font-medium text-text-primary mb-3">
          Current Activity Level
        </Text>
        <View className="gap-2 mb-8">
          {ACTIVITY_LEVELS.map((level) => (
            <Pressable
              key={level.value}
              onPress={() => setActivityLevel(level.value)}
              className={`px-4 py-3 rounded-xl border-2 ${
                activityLevel === level.value
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 bg-surface-secondary"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activityLevel === level.value
                    ? "text-primary-600"
                    : "text-text-primary"
                }`}
              >
                {level.label}
              </Text>
              <Text className="text-xs text-text-tertiary mt-0.5">
                {level.description}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Exercise Equipment */}
        <Text className="text-sm font-medium text-text-primary mb-3">
          Available Exercise Equipment
        </Text>
        <Text className="text-xs text-text-tertiary mb-3">
          Select all that you have access to
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-10">
          {EQUIPMENT_OPTIONS.map((eq) => {
            const isSelected = selectedEquipment.has(eq.id);
            return (
              <Pressable
                key={eq.id}
                onPress={() => toggleEquipment(eq.id)}
                className={`px-4 py-2.5 rounded-xl border-2 ${
                  isSelected
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 bg-surface-secondary"
                }`}
              >
                <Text
                  className={`text-sm ${
                    isSelected
                      ? "text-primary-600 font-medium"
                      : "text-text-primary"
                  }`}
                >
                  {eq.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="bg-primary-600 h-14 rounded-xl items-center justify-center active:bg-primary-700"
        >
          {isSubmitting ? (
            <View className="flex-row items-center gap-3">
              <ActivityIndicator color="#FFFFFF" />
              <Text className="text-white text-base font-semibold">
                Calculating your assessment...
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Ionicons name="pulse" size={20} color="#FFFFFF" />
              <Text className="text-white text-base font-semibold">
                Get My Assessment
              </Text>
            </View>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
