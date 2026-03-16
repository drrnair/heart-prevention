import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const SMOKING_OPTIONS = [
  { value: "never", label: "Never smoked" },
  { value: "former", label: "Former smoker" },
  { value: "current", label: "Current smoker" },
] as const;

const DIABETES_OPTIONS = [
  { value: "none", label: "None" },
  { value: "prediabetes", label: "Prediabetes" },
  { value: "type1", label: "Type 1 Diabetes" },
  { value: "type2", label: "Type 2 Diabetes" },
] as const;

export default function MedicalHistoryScreen() {
  const router = useRouter();

  const [smokingStatus, setSmokingStatus] = useState<string | null>(null);
  const [diabetesStatus, setDiabetesStatus] = useState<string | null>(null);
  const [onBPMeds, setOnBPMeds] = useState(false);
  const [onStatin, setOnStatin] = useState(false);
  const [onAspirin, setOnAspirin] = useState(false);
  const [familyHistory, setFamilyHistory] = useState(false);
  const [preeclampsia, setPreeclampsia] = useState(false);
  const [prematureMenopause, setPrematureMenopause] = useState(false);
  const [ckd, setCkd] = useState(false);
  const [chronicInflammatory, setChronicInflammatory] = useState(false);

  const handleNext = () => {
    router.push("/(onboarding)/preferences");
  };

  const renderOptionSelector = (
    label: string,
    options: readonly { readonly value: string; readonly label: string }[],
    selected: string | null,
    onSelect: (v: string) => void,
  ) => (
    <View className="mb-6">
      <Text className="text-sm font-medium text-text-primary mb-3">
        {label}
      </Text>
      <View className="gap-2">
        {options.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            className={`px-4 py-3 rounded-xl border-2 ${
              selected === opt.value
                ? "border-primary-600 bg-primary-50"
                : "border-gray-200 bg-surface-secondary"
            }`}
          >
            <Text
              className={`text-sm ${
                selected === opt.value
                  ? "text-primary-600 font-medium"
                  : "text-text-primary"
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderToggle = (
    label: string,
    value: boolean,
    onToggle: (v: boolean) => void,
    description?: string,
  ) => (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
      <View className="flex-1 mr-4">
        <Text className="text-sm text-text-primary">{label}</Text>
        {description && (
          <Text className="text-xs text-text-tertiary mt-0.5">
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#D1D5DB", true: "#FECACA" }}
        thumbColor={value ? "#DC2626" : "#F9FAFB"}
      />
    </View>
  );

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
            <View className="flex-1 h-1.5 rounded-full bg-gray-200" />
          </View>
          <Text className="ml-3 text-xs text-text-tertiary">3 of 4</Text>
        </View>

        {/* Header */}
        <Text className="text-2xl font-bold text-text-primary mb-2">
          Medical History
        </Text>
        <Text className="text-sm text-text-secondary mb-8">
          These factors are used by validated risk scoring algorithms.
        </Text>

        {/* Smoking */}
        {renderOptionSelector(
          "Smoking Status",
          SMOKING_OPTIONS,
          smokingStatus,
          setSmokingStatus,
        )}

        {/* Diabetes */}
        {renderOptionSelector(
          "Diabetes Status",
          DIABETES_OPTIONS,
          diabetesStatus,
          setDiabetesStatus,
        )}

        {/* Medication Toggles */}
        <Text className="text-sm font-medium text-text-primary mb-2">
          Current Medications
        </Text>
        <View className="bg-surface-secondary rounded-xl px-4 mb-6">
          {renderToggle(
            "Blood pressure medication",
            onBPMeds,
            setOnBPMeds,
          )}
          {renderToggle("Statin therapy", onStatin, setOnStatin)}
          {renderToggle("Aspirin", onAspirin, setOnAspirin)}
        </View>

        {/* Family History */}
        <Text className="text-sm font-medium text-text-primary mb-2">
          Family History
        </Text>
        <View className="bg-surface-secondary rounded-xl px-4 mb-6">
          {renderToggle(
            "Family history of premature CVD",
            familyHistory,
            setFamilyHistory,
            "First-degree relative: male <55 or female <65 years",
          )}
        </View>

        {/* Risk Enhancers */}
        <Text className="text-sm font-medium text-text-primary mb-1">
          Risk-Enhancing Factors
        </Text>
        <Text className="text-xs text-text-tertiary mb-3">
          These may increase your risk beyond what standard calculators estimate
        </Text>
        <View className="bg-surface-secondary rounded-xl px-4 mb-8">
          {renderToggle(
            "History of preeclampsia",
            preeclampsia,
            setPreeclampsia,
          )}
          {renderToggle(
            "Premature menopause (before age 40)",
            prematureMenopause,
            setPrematureMenopause,
          )}
          {renderToggle(
            "Chronic kidney disease (CKD)",
            ckd,
            setCkd,
          )}
          {renderToggle(
            "Chronic inflammatory condition",
            chronicInflammatory,
            setChronicInflammatory,
            "e.g., Rheumatoid arthritis, Lupus, Psoriasis",
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
