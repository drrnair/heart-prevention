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
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

interface ExtractedValue {
  readonly name: string;
  readonly value: string;
  readonly unit: string;
  readonly referenceRange: string;
  readonly isAbnormal: boolean;
}

type UploadStage = "select" | "processing" | "review" | "confirmed";

// Mock extracted values
const MOCK_EXTRACTED: readonly ExtractedValue[] = [
  {
    name: "Total Cholesterol",
    value: "218",
    unit: "mg/dL",
    referenceRange: "<200",
    isAbnormal: true,
  },
  {
    name: "LDL Cholesterol",
    value: "142",
    unit: "mg/dL",
    referenceRange: "<100",
    isAbnormal: true,
  },
  {
    name: "HDL Cholesterol",
    value: "48",
    unit: "mg/dL",
    referenceRange: ">40",
    isAbnormal: false,
  },
  {
    name: "Triglycerides",
    value: "138",
    unit: "mg/dL",
    referenceRange: "<150",
    isAbnormal: false,
  },
  {
    name: "Fasting Glucose",
    value: "102",
    unit: "mg/dL",
    referenceRange: "<100",
    isAbnormal: true,
  },
  {
    name: "HbA1c",
    value: "5.8",
    unit: "%",
    referenceRange: "<5.7",
    isAbnormal: true,
  },
];

export default function UploadScreen() {
  const [stage, setStage] = useState<UploadStage>("select");
  const [extractedValues, setExtractedValues] = useState<
    readonly ExtractedValue[]
  >([]);

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Camera permission is needed to photograph your reports.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      processImage(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Photo library permission is needed to upload your reports.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (_uri: string) => {
    setStage("processing");

    try {
      // Simulate API processing - in production, POST image to API
      await new Promise((resolve) => setTimeout(resolve, 2500));

      setExtractedValues(MOCK_EXTRACTED);
      setStage("review");
    } catch {
      Alert.alert(
        "Processing Failed",
        "We couldn't analyze your report. Please try again or use manual entry.",
      );
      setStage("select");
    }
  };

  const handleConfirm = () => {
    setStage("confirmed");
  };

  const handleReject = () => {
    setStage("select");
    setExtractedValues([]);
  };

  if (stage === "processing") {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="text-lg font-semibold text-text-primary mt-4">
          Analyzing your report...
        </Text>
        <Text className="text-sm text-text-secondary mt-2 text-center px-8">
          Our AI is extracting values from your uploaded report. This may take a
          moment.
        </Text>
      </SafeAreaView>
    );
  }

  if (stage === "confirmed") {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
        </View>
        <Text className="text-xl font-bold text-text-primary mb-2">
          Values Saved
        </Text>
        <Text className="text-sm text-text-secondary text-center mb-8">
          Your report values have been saved and your risk assessment is being
          recalculated.
        </Text>
        <Pressable
          onPress={() => {
            setStage("select");
            setExtractedValues([]);
          }}
          className="bg-primary-600 px-8 py-3 rounded-xl active:bg-primary-700"
        >
          <Text className="text-white font-semibold">Upload Another</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (stage === "review") {
    return (
      <SafeAreaView className="flex-1 bg-surface-secondary">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 py-4 pb-8"
        >
          {/* Header */}
          <View className="mb-4">
            <Text className="text-xl font-bold text-text-primary">
              Review Extracted Values
            </Text>
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
              <View className="flex-row items-start gap-2">
                <Ionicons
                  name="warning"
                  size={18}
                  color="#D97706"
                />
                <Text className="flex-1 text-xs text-amber-800 leading-4">
                  These values were extracted by AI. Please verify each value
                  against your original report before confirming.
                </Text>
              </View>
            </View>
          </View>

          {/* Extracted Values */}
          <View className="gap-2 mb-6">
            {extractedValues.map((item) => (
              <View
                key={item.name}
                className={`bg-white rounded-xl p-4 border ${
                  item.isAbnormal ? "border-red-200" : "border-gray-100"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-medium text-text-primary">
                    {item.name}
                  </Text>
                  {item.isAbnormal && (
                    <View className="bg-red-100 rounded-full px-2 py-0.5">
                      <Text className="text-2xs font-medium text-red-700">
                        Abnormal
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-baseline mt-1">
                  <Text className="text-xl font-bold text-text-primary">
                    {item.value}
                  </Text>
                  <Text className="text-sm text-text-secondary ml-1">
                    {item.unit}
                  </Text>
                </View>
                <Text className="text-xs text-text-tertiary mt-1">
                  Reference: {item.referenceRange}
                </Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={handleConfirm}
              className="bg-primary-600 h-12 rounded-xl items-center justify-center active:bg-primary-700"
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text className="text-white text-base font-semibold">
                  Confirm Values
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleReject}
              className="h-12 rounded-xl items-center justify-center border border-gray-200 active:bg-gray-50"
            >
              <Text className="text-text-primary text-base font-medium">
                Reject & Re-upload
              </Text>
            </Pressable>
          </View>

          <DisclaimerBanner disclaimerKey="upload" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Select stage
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-6">
        {/* Header */}
        <Text className="text-2xl font-bold text-text-primary mb-2">
          Upload Report
        </Text>
        <Text className="text-sm text-text-secondary mb-8">
          Photograph or select a blood test report or imaging result. Our AI
          will extract the values for you.
        </Text>

        {/* Camera Button */}
        <Pressable
          onPress={pickFromCamera}
          className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-6 items-center mb-4 active:bg-primary-100"
        >
          <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-3">
            <Ionicons name="camera" size={32} color="#DC2626" />
          </View>
          <Text className="text-base font-semibold text-primary-700">
            Take a Photo
          </Text>
          <Text className="text-xs text-primary-500 mt-1 text-center">
            Photograph your paper report
          </Text>
        </Pressable>

        {/* Gallery Button */}
        <Pressable
          onPress={pickFromGallery}
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 items-center mb-4 active:bg-blue-100"
        >
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
            <Ionicons name="images" size={32} color="#3B82F6" />
          </View>
          <Text className="text-base font-semibold text-blue-700">
            Choose from Gallery
          </Text>
          <Text className="text-xs text-blue-500 mt-1 text-center">
            Select an existing photo of your report
          </Text>
        </Pressable>

        {/* Manual Entry */}
        <Pressable className="bg-surface-secondary border border-gray-200 rounded-2xl p-6 items-center active:bg-surface-tertiary">
          <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
            <Ionicons name="create" size={32} color="#6B7280" />
          </View>
          <Text className="text-base font-semibold text-text-primary">
            Manual Entry
          </Text>
          <Text className="text-xs text-text-secondary mt-1 text-center">
            Enter values yourself from your report
          </Text>
        </Pressable>

        <View className="mt-auto">
          <DisclaimerBanner disclaimerKey="upload" />
        </View>
      </View>
    </SafeAreaView>
  );
}
