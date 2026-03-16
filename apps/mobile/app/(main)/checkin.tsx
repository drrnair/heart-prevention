import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { useCheckins } from "@/hooks/useCheckins";
import { useWearable } from "@/hooks/useWearable";

interface CheckinFormData {
  readonly moodLevel: number;
  readonly exerciseMinutes: number;
  readonly sleepHoursAvg: number;
  readonly stressLevel: number;
  readonly medicationAdherence: number;
  readonly notes: string;
  readonly weekStarting: string;
}

const MOOD_OPTIONS: readonly { readonly emoji: string; readonly value: number }[] = [
  { emoji: "😞", value: 1 },
  { emoji: "😕", value: 2 },
  { emoji: "😐", value: 3 },
  { emoji: "🙂", value: 4 },
  { emoji: "😊", value: 5 },
] as const;

function getWeekStarting(): string {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return monday.toISOString().split("T")[0];
}

function SectionLabel({ text }: { readonly text: string }) {
  return (
    <Text className="text-sm font-semibold text-text-primary mb-2">{text}</Text>
  );
}

function SuccessView({ onBack }: { readonly onBack: () => void }) {
  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
        </View>
        <Text className="text-2xl font-bold text-text-primary mb-2">
          Check-in Recorded
        </Text>
        <Text className="text-sm text-text-secondary text-center mb-8">
          Your check-in has been recorded
        </Text>
        <Pressable
          onPress={onBack}
          className="bg-red-600 rounded-xl px-8 py-3 active:bg-red-700"
          accessibilityRole="button"
          accessibilityLabel="Back to dashboard"
        >
          <Text className="text-white font-semibold text-base">
            Back to Dashboard
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function CheckinScreen() {
  const router = useRouter();
  const { checkins, submit, isSubmitting } = useCheckins();
  const { isConnected, sync, latestData, isSyncing } = useWearable();
  const [prefilledFields, setPrefilledFields] = useState<ReadonlySet<string>>(new Set());

  const weekStarting = useMemo(() => getWeekStarting(), []);

  const alreadySubmitted = useMemo(
    () => checkins.some((c) => c.weekStarting === weekStarting),
    [checkins, weekStarting],
  );

  const [moodLevel, setMoodLevel] = useState(3);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [sleepHoursAvg, setSleepHoursAvg] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [medicationAdherence, setMedicationAdherence] = useState(100);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handlePrefillFromWearable = async () => {
    await sync();
    const data = latestData;
    if (!data) return;
    const filled = new Set<string>();
    if (data.exerciseMinutes != null) {
      setExerciseMinutes(data.exerciseMinutes);
      filled.add("exerciseMinutes");
    }
    if (data.sleepHours != null) {
      setSleepHoursAvg(data.sleepHours);
      filled.add("sleepHoursAvg");
    }
    setPrefilledFields(filled);
  };

  const handleSubmit = async () => {
    if (isSubmitting || alreadySubmitted) return;

    const data: CheckinFormData = {
      moodLevel,
      exerciseMinutes,
      sleepHoursAvg,
      stressLevel,
      medicationAdherence,
      notes: notes.trim(),
      weekStarting,
    };

    try {
      await submit(data);
      setSubmitted(true);
    } catch {
      Alert.alert("Error", "Failed to submit check-in. Please try again.");
    }
  };

  if (submitted) {
    return <SuccessView onBack={() => router.back()} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm mr-3"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </Pressable>
          <View>
            <Text className="text-2xl font-bold text-text-primary">
              Weekly Check-in
            </Text>
            <Text className="text-xs text-text-tertiary">
              Week of {weekStarting}
            </Text>
          </View>
        </View>

        {alreadySubmitted && (
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex-row items-center gap-2">
            <Ionicons name="warning" size={18} color="#D97706" />
            <Text className="text-xs text-amber-800 flex-1">
              You have already submitted a check-in for this week.
            </Text>
          </View>
        )}

        {isConnected && (
          <Pressable
            onPress={handlePrefillFromWearable}
            disabled={isSyncing}
            className={`flex-row items-center justify-center gap-2 rounded-xl py-3 mb-4 ${
              isSyncing
                ? "bg-gray-200"
                : "bg-blue-50 border border-blue-200 active:bg-blue-100"
            }`}
            accessibilityRole="button"
            accessibilityLabel={isSyncing ? "Syncing wearable data" : "Pre-fill from wearable"}
          >
            <Ionicons name="watch-outline" size={18} color={isSyncing ? "#9CA3AF" : "#3B82F6"} />
            <Text className={`text-sm font-semibold ${isSyncing ? "text-gray-500" : "text-blue-700"}`}>
              {isSyncing ? "Syncing..." : "Pre-fill from Wearable"}
            </Text>
          </Pressable>
        )}

        {/* Mood */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <SectionLabel text="How are you feeling?" />
          <View className="flex-row justify-between px-2">
            {MOOD_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setMoodLevel(option.value)}
                className={`w-14 h-14 rounded-full items-center justify-center ${
                  moodLevel === option.value
                    ? "bg-red-100 border-2 border-red-600"
                    : "bg-gray-50"
                }`}
                accessibilityRole="button"
                accessibilityLabel={`Mood level ${option.value}`}
                accessibilityState={{ selected: moodLevel === option.value }}
              >
                <Text className="text-2xl">{option.emoji}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Exercise Minutes */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <View className="flex-row items-center gap-1.5">
            <SectionLabel text="Exercise this week (minutes)" />
            {prefilledFields.has("exerciseMinutes") && (
              <Ionicons name="watch-outline" size={14} color="#3B82F6" />
            )}
          </View>
          <View className="flex-row items-center justify-center gap-4">
            <Pressable
              onPress={() =>
                setExerciseMinutes((prev) => Math.max(0, prev - 15))
              }
              className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center active:bg-gray-200"
              accessibilityRole="button"
              accessibilityLabel="Decrease exercise minutes"
            >
              <Ionicons name="remove" size={24} color="#374151" />
            </Pressable>
            <View className="w-24 items-center">
              <Text className="text-3xl font-bold text-text-primary">
                {exerciseMinutes}
              </Text>
              <Text className="text-xs text-text-secondary">min</Text>
            </View>
            <Pressable
              onPress={() =>
                setExerciseMinutes((prev) => Math.min(600, prev + 15))
              }
              className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center active:bg-gray-200"
              accessibilityRole="button"
              accessibilityLabel="Increase exercise minutes"
            >
              <Ionicons name="add" size={24} color="#374151" />
            </Pressable>
          </View>
        </View>

        {/* Sleep Hours */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <View className="flex-row items-center gap-1.5">
            <SectionLabel text="Average sleep (hours/night)" />
            {prefilledFields.has("sleepHoursAvg") && (
              <Ionicons name="watch-outline" size={14} color="#3B82F6" />
            )}
          </View>
          <Slider
            minimumValue={0}
            maximumValue={12}
            step={0.5}
            value={sleepHoursAvg}
            onValueChange={setSleepHoursAvg}
            minimumTrackTintColor="#DC2626"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#DC2626"
            accessibilityLabel="Average sleep hours per night"
          />
          <Text className="text-center text-lg font-semibold text-text-primary mt-1">
            {sleepHoursAvg.toFixed(1)} hrs
          </Text>
        </View>

        {/* Stress Level */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <SectionLabel text="Stress level" />
          <Slider
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={stressLevel}
            onValueChange={setStressLevel}
            minimumTrackTintColor="#DC2626"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#DC2626"
            accessibilityLabel="Stress level"
          />
          <View className="flex-row justify-between mt-1">
            <Text className="text-xs text-text-secondary">Low</Text>
            <Text className="text-lg font-semibold text-text-primary">
              {stressLevel}
            </Text>
            <Text className="text-xs text-text-secondary">High</Text>
          </View>
        </View>

        {/* Medication Adherence */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <SectionLabel text="Medication adherence" />
          <Slider
            minimumValue={0}
            maximumValue={100}
            step={5}
            value={medicationAdherence}
            onValueChange={setMedicationAdherence}
            minimumTrackTintColor="#DC2626"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#DC2626"
            accessibilityLabel="Medication adherence"
          />
          <Text className="text-center text-lg font-semibold text-text-primary mt-1">
            {medicationAdherence}%
          </Text>
        </View>

        {/* Notes */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <SectionLabel text="Notes (optional)" />
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            placeholder="Anything else you'd like to note..."
            placeholderTextColor="#9CA3AF"
            className="bg-gray-50 rounded-xl p-3 text-sm text-text-primary min-h-[100px]"
            textAlignVertical="top"
            accessibilityLabel="Notes"
          />
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || alreadySubmitted}
          className={`rounded-xl py-4 items-center ${
            isSubmitting || alreadySubmitted
              ? "bg-gray-300"
              : "bg-red-600 active:bg-red-700"
          }`}
          accessibilityRole="button"
          accessibilityLabel={isSubmitting ? "Submitting check-in" : "Submit check-in"}
        >
          <Text className="text-white font-semibold text-base">
            {isSubmitting ? "Submitting..." : "Submit Check-in"}
          </Text>
        </Pressable>

        <DisclaimerBanner disclaimerKey="general" />
      </ScrollView>
    </SafeAreaView>
  );
}
