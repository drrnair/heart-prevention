import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DISCLAIMERS: Record<string, { short: string; full: string }> = {
  general: {
    short:
      "This app provides wellness information only. It is not a medical device.",
    full: "HeartPrevention is a wellness and educational tool. It does not diagnose, treat, cure, or prevent any disease. The risk estimates and recommendations are based on published guidelines and are intended for educational purposes. Always consult your healthcare provider for medical decisions. This app is not a substitute for professional medical advice.",
  },
  risk: {
    short:
      "Risk estimates are for educational purposes. Discuss with your doctor.",
    full: "The cardiovascular risk estimates shown are calculated using validated scoring algorithms (Pooled Cohort Equations, SCORE2, MESA, etc.) based on the data you provide. These are population-level estimates and may not reflect your individual risk. Risk estimates improve in accuracy with more complete data. Always discuss your results with a qualified healthcare provider.",
  },
  lifestyle: {
    short:
      "Lifestyle suggestions are general guidance. Consult your provider before changes.",
    full: "The lifestyle recommendations provided are generated based on published cardiovascular health guidelines and your profile data. They are general wellness suggestions and are not personalized medical prescriptions. Before making significant changes to your diet, exercise routine, or supplement regimen, consult your healthcare provider, especially if you have existing medical conditions.",
  },
  upload: {
    short: "AI-extracted values should be verified before use.",
    full: "Values extracted from uploaded reports use optical character recognition and AI interpretation. While we strive for accuracy, automated extraction can make errors. Always review and confirm extracted values against your original report before saving. Incorrectly entered values will affect your risk assessment accuracy.",
  },
  recommendations: {
    short:
      "Test suggestions are educational. Discuss with your healthcare provider.",
    full: "The recommended tests and investigations are based on published clinical guidelines (ACC/AHA, ESC, etc.) and your current data completeness level. These are educational suggestions to help you have informed discussions with your healthcare provider. Your doctor may recommend different or additional tests based on your complete clinical picture.",
  },
};

interface DisclaimerBannerProps {
  readonly disclaimerKey: keyof typeof DISCLAIMERS;
}

export function DisclaimerBanner({ disclaimerKey }: DisclaimerBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const disclaimer = DISCLAIMERS[disclaimerKey];

  if (!disclaimer) return null;

  return (
    <Pressable
      onPress={() => setIsExpanded((prev) => !prev)}
      className="bg-gray-50 border border-gray-200 rounded-xl p-3 mt-4"
    >
      <View className="flex-row items-start gap-2">
        <Ionicons
          name="information-circle-outline"
          size={18}
          color="#6B7280"
        />
        <View className="flex-1">
          <Text className="text-xs text-text-secondary leading-4">
            {isExpanded ? disclaimer.full : disclaimer.short}
          </Text>
          {!isExpanded && (
            <Text className="text-2xs text-text-tertiary mt-1">
              Tap to read full disclaimer
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
