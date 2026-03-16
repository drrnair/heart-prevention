import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type UnitSystem = "metric" | "imperial";

export default function MeasurementsScreen() {
  const router = useRouter();

  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [hipCm, setHipCm] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulseRate, setPulseRate] = useState("");

  const handleBPBlur = useCallback(() => {
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);

    if (sys && dia && sys < dia) {
      Alert.alert(
        "Check Blood Pressure",
        `You entered ${sys}/${dia}. Did you mean ${dia}/${sys}? The top number (systolic) is usually higher than the bottom number (diastolic).`,
        [
          { text: "Keep as entered", style: "cancel" },
          {
            text: "Swap values",
            onPress: () => {
              setSystolic(String(dia));
              setDiastolic(String(sys));
            },
          },
        ],
      );
    }
  }, [systolic, diastolic]);

  const handleNext = () => {
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);

    if (sys && dia && sys < dia) {
      Alert.alert(
        "Check Blood Pressure",
        `You entered ${sys}/${dia}. Did you mean ${dia}/${sys}? The top number (systolic) is usually higher than the bottom number (diastolic).`,
        [
          {
            text: "Keep & Continue",
            onPress: () => router.push("/(onboarding)/medical-history"),
          },
          {
            text: "Swap & Continue",
            onPress: () => {
              setSystolic(String(dia));
              setDiastolic(String(sys));
              router.push("/(onboarding)/medical-history");
            },
          },
          { text: "Go Back & Edit", style: "cancel" },
        ],
      );
      return;
    }

    router.push("/(onboarding)/medical-history");
  };

  const renderNumberInput = (
    label: string,
    value: string,
    onChangeText: (t: string) => void,
    placeholder: string,
    unit: string,
  ) => (
    <View className="mb-4">
      <Text className="text-sm font-medium text-text-primary mb-1.5">
        {label}
      </Text>
      <View className="flex-row items-center bg-surface-secondary border border-gray-200 rounded-xl px-4 h-12">
        <TextInput
          className="flex-1 text-base text-text-primary"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
        />
        <Text className="text-sm text-text-tertiary ml-2">{unit}</Text>
      </View>
    </View>
  );

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
            <View className="flex-1 h-1.5 rounded-full bg-primary-600" />
            <View className="flex-1 h-1.5 rounded-full bg-gray-200" />
            <View className="flex-1 h-1.5 rounded-full bg-gray-200" />
          </View>
          <Text className="ml-3 text-xs text-text-tertiary">2 of 4</Text>
        </View>

        {/* Header */}
        <Text className="text-2xl font-bold text-text-primary mb-2">
          Physical Measurements
        </Text>
        <Text className="text-sm text-text-secondary mb-6">
          These help calculate body metrics and estimate cardiovascular risk.
        </Text>

        {/* Unit Toggle */}
        <View className="flex-row bg-surface-tertiary rounded-xl p-1 mb-6">
          <Pressable
            onPress={() => setUnitSystem("metric")}
            className={`flex-1 py-2 rounded-lg items-center ${
              unitSystem === "metric" ? "bg-white shadow-sm" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
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
            className={`flex-1 py-2 rounded-lg items-center ${
              unitSystem === "imperial" ? "bg-white shadow-sm" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                unitSystem === "imperial"
                  ? "text-primary-600"
                  : "text-text-secondary"
              }`}
            >
              Imperial (ft, lbs)
            </Text>
          </Pressable>
        </View>

        {/* Height */}
        {unitSystem === "metric" ? (
          renderNumberInput("Height", heightCm, setHeightCm, "170", "cm")
        ) : (
          <View className="mb-4">
            <Text className="text-sm font-medium text-text-primary mb-1.5">
              Height
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1 flex-row items-center bg-surface-secondary border border-gray-200 rounded-xl px-4 h-12">
                <TextInput
                  className="flex-1 text-base text-text-primary"
                  placeholder="5"
                  placeholderTextColor="#9CA3AF"
                  value={heightFt}
                  onChangeText={setHeightFt}
                  keyboardType="numeric"
                />
                <Text className="text-sm text-text-tertiary ml-2">ft</Text>
              </View>
              <View className="flex-1 flex-row items-center bg-surface-secondary border border-gray-200 rounded-xl px-4 h-12">
                <TextInput
                  className="flex-1 text-base text-text-primary"
                  placeholder="8"
                  placeholderTextColor="#9CA3AF"
                  value={heightIn}
                  onChangeText={setHeightIn}
                  keyboardType="numeric"
                />
                <Text className="text-sm text-text-tertiary ml-2">in</Text>
              </View>
            </View>
          </View>
        )}

        {/* Weight */}
        {unitSystem === "metric"
          ? renderNumberInput("Weight", weightKg, setWeightKg, "70", "kg")
          : renderNumberInput(
              "Weight",
              weightLbs,
              setWeightLbs,
              "154",
              "lbs",
            )}

        {/* Waist & Hip */}
        {renderNumberInput(
          "Waist Circumference",
          waistCm,
          setWaistCm,
          unitSystem === "metric" ? "85" : "33",
          unitSystem === "metric" ? "cm" : "in",
        )}

        {renderNumberInput(
          "Hip Circumference",
          hipCm,
          setHipCm,
          unitSystem === "metric" ? "95" : "37",
          unitSystem === "metric" ? "cm" : "in",
        )}

        {/* Blood Pressure */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-text-primary mb-1.5">
            Blood Pressure
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="flex-1 flex-row items-center bg-surface-secondary border border-gray-200 rounded-xl px-4 h-12">
              <TextInput
                className="flex-1 text-base text-text-primary"
                placeholder="120"
                placeholderTextColor="#9CA3AF"
                value={systolic}
                onChangeText={setSystolic}
                onBlur={handleBPBlur}
                keyboardType="numeric"
              />
              <Text className="text-xs text-text-tertiary ml-1">systolic</Text>
            </View>
            <Text className="text-lg text-text-tertiary">/</Text>
            <View className="flex-1 flex-row items-center bg-surface-secondary border border-gray-200 rounded-xl px-4 h-12">
              <TextInput
                className="flex-1 text-base text-text-primary"
                placeholder="80"
                placeholderTextColor="#9CA3AF"
                value={diastolic}
                onChangeText={setDiastolic}
                onBlur={handleBPBlur}
                keyboardType="numeric"
              />
              <Text className="text-xs text-text-tertiary ml-1">
                diastolic
              </Text>
            </View>
          </View>
          <Text className="text-xs text-text-tertiary mt-1">mmHg</Text>
        </View>

        {/* Pulse Rate */}
        {renderNumberInput(
          "Resting Pulse Rate",
          pulseRate,
          setPulseRate,
          "72",
          "bpm",
        )}

        {/* Next Button */}
        <Pressable
          onPress={handleNext}
          className="bg-primary-600 h-12 rounded-xl items-center justify-center mt-4 active:bg-primary-700"
        >
          <Text className="text-white text-base font-semibold">Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
