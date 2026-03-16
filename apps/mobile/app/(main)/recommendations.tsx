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
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

type RecommendationStatus =
  | "pending"
  | "scheduled"
  | "completed"
  | "declined"
  | "snoozed";

interface Recommendation {
  readonly id: string;
  readonly testName: string;
  readonly measures: string;
  readonly relevance: string;
  readonly impactOnEstimate: string;
  readonly guideline: string;
  readonly tier: number;
  status: RecommendationStatus;
}

const STATUS_BADGES: Record<
  RecommendationStatus,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "bg-gray-100", text: "text-gray-700", label: "Pending" },
  scheduled: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Scheduled",
  },
  completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Completed",
  },
  declined: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Declined",
  },
  snoozed: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Snoozed",
  },
};

const MOCK_RECOMMENDATIONS: readonly Recommendation[] = [
  {
    id: "1",
    testName: "Lipid Panel",
    measures: "Total Cholesterol, LDL, HDL, Triglycerides",
    relevance:
      "Core requirement for all major risk calculators (PCE, SCORE2, QRISK3). Your current estimate uses imputed values.",
    impactOnEstimate: "May narrow your confidence range by 40-60%",
    guideline: "ACC/AHA 2019 Primary Prevention Guidelines",
    tier: 1,
    status: "pending",
  },
  {
    id: "2",
    testName: "Fasting Glucose & HbA1c",
    measures: "Fasting blood glucose, Glycated hemoglobin (HbA1c)",
    relevance:
      "Diabetes status significantly impacts risk. Currently using self-reported status.",
    impactOnEstimate: "Refines diabetes component of risk score",
    guideline: "ADA Standards of Care 2024",
    tier: 1,
    status: "pending",
  },
  {
    id: "3",
    testName: "hsCRP (High-Sensitivity C-Reactive Protein)",
    measures: "Systemic inflammation marker",
    relevance:
      "Risk-enhancing factor per ACC/AHA. Relevant given your family history of premature CVD.",
    impactOnEstimate: "May reclassify risk if elevated (>2 mg/L)",
    guideline: "ACC/AHA 2019 - Risk Enhancing Factors",
    tier: 2,
    status: "pending",
  },
  {
    id: "4",
    testName: "Lipoprotein(a)",
    measures: "Lp(a) level - genetically determined atherogenic lipoprotein",
    relevance:
      "Risk-enhancing factor. Elevated Lp(a) found in ~20% of population. Once-in-a-lifetime test.",
    impactOnEstimate: "May reclassify borderline risk upward if >50 mg/dL",
    guideline: "ACC/AHA 2019, ESC/EAS 2020 Dyslipidemia Guidelines",
    tier: 2,
    status: "pending",
  },
  {
    id: "5",
    testName: "Coronary Artery Calcium (CAC) Score",
    measures: "CT scan measuring calcified plaque in coronary arteries",
    relevance:
      "Most powerful risk reclassifier for borderline risk. Your current estimate falls in borderline range.",
    impactOnEstimate:
      "CAC=0 may reclassify to low risk; CAC>100 to high risk",
    guideline: "ACC/AHA 2019 - Coronary Calcium Score",
    tier: 3,
    status: "pending",
  },
  {
    id: "6",
    testName: "ABI (Ankle-Brachial Index)",
    measures: "Ratio of ankle to arm blood pressure",
    relevance:
      "Detects peripheral artery disease, a coronary risk equivalent.",
    impactOnEstimate:
      "ABI <0.9 may reclassify to high risk",
    guideline: "ACC/AHA 2019 - Risk Enhancing Factors",
    tier: 3,
    status: "pending",
  },
];

export default function RecommendationsScreen() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    [...MOCK_RECOMMENDATIONS],
  );

  const updateStatus = (id: string, newStatus: RecommendationStatus) => {
    setRecommendations((prev) =>
      prev.map((rec) =>
        rec.id === id ? { ...rec, status: newStatus } : rec,
      ),
    );
  };

  const handlePrint = () => {
    Alert.alert(
      "Print List",
      "This feature will generate a printable PDF of recommended tests to bring to your healthcare provider.",
    );
  };

  const tiers = [1, 2, 3];
  const tierLabels: Record<number, string> = {
    1: "Tier 1 - Essential (Core Risk Scoring)",
    2: "Tier 2 - Risk Enhancers",
    3: "Tier 3 - Advanced Reclassifiers",
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 pb-8"
      >
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-text-primary">
              Recommended Tests
            </Text>
          </View>
          <Pressable
            onPress={handlePrint}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <Ionicons name="print-outline" size={20} color="#111827" />
          </Pressable>
        </View>

        {/* Tiers */}
        {tiers.map((tier) => {
          const tierRecs = recommendations.filter((r) => r.tier === tier);
          if (tierRecs.length === 0) return null;

          return (
            <View key={tier} className="mb-6">
              <Text className="text-sm font-semibold text-text-primary mb-3 ml-1">
                {tierLabels[tier]}
              </Text>

              <View className="gap-3">
                {tierRecs.map((rec) => {
                  const badge = STATUS_BADGES[rec.status];
                  return (
                    <View
                      key={rec.id}
                      className="bg-white rounded-2xl p-4 shadow-sm"
                    >
                      <View className="flex-row items-start justify-between mb-2">
                        <Text className="text-base font-semibold text-text-primary flex-1 mr-2">
                          {rec.testName}
                        </Text>
                        <View
                          className={`${badge.bg} rounded-full px-2.5 py-0.5`}
                        >
                          <Text
                            className={`text-2xs font-medium ${badge.text}`}
                          >
                            {badge.label}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-xs text-text-secondary mb-2">
                        <Text className="font-medium">Measures: </Text>
                        {rec.measures}
                      </Text>

                      <Text className="text-xs text-text-secondary mb-2">
                        <Text className="font-medium">Why for you: </Text>
                        {rec.relevance}
                      </Text>

                      <View className="bg-blue-50 rounded-lg p-2 mb-2">
                        <Text className="text-xs text-blue-700">
                          <Text className="font-medium">Impact: </Text>
                          {rec.impactOnEstimate}
                        </Text>
                      </View>

                      <Text className="text-2xs text-text-tertiary mb-3">
                        Guideline: {rec.guideline}
                      </Text>

                      {/* Action Buttons */}
                      {rec.status === "pending" && (
                        <View className="flex-row gap-2">
                          <Pressable
                            onPress={() =>
                              updateStatus(rec.id, "scheduled")
                            }
                            className="flex-1 bg-blue-50 py-2 rounded-lg items-center active:bg-blue-100"
                          >
                            <Text className="text-xs font-medium text-blue-700">
                              Schedule
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() =>
                              updateStatus(rec.id, "completed")
                            }
                            className="flex-1 bg-green-50 py-2 rounded-lg items-center active:bg-green-100"
                          >
                            <Text className="text-xs font-medium text-green-700">
                              Completed
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() =>
                              updateStatus(rec.id, "declined")
                            }
                            className="flex-1 bg-gray-50 py-2 rounded-lg items-center active:bg-gray-100"
                          >
                            <Text className="text-xs font-medium text-gray-600">
                              Decline
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() =>
                              updateStatus(rec.id, "snoozed")
                            }
                            className="flex-1 bg-amber-50 py-2 rounded-lg items-center active:bg-amber-100"
                          >
                            <Text className="text-xs font-medium text-amber-700">
                              Snooze
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <DisclaimerBanner disclaimerKey="recommendations" />
      </ScrollView>
    </SafeAreaView>
  );
}
