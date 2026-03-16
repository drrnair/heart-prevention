import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CompletenessMeter } from "@/components/CompletenessMeter";
import { ConfidenceRange } from "@/components/ConfidenceRange";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

// Mock data - in production, fetch from API
type RiskLevel = "low" | "borderline" | "intermediate" | "high";
type DataLevel = 1 | 2 | 3 | 4;

interface Assessment {
  readonly risk_percentage: number;
  readonly confidence_low: number;
  readonly confidence_high: number;
  readonly risk_level: RiskLevel;
  readonly is_preliminary: boolean;
  readonly data_level: DataLevel;
  readonly next_level_hint: string;
  readonly bmi: number;
  readonly whr: number;
  readonly whtr: number;
  readonly risk_enhancers_count: number;
  readonly last_updated: string;
}

const MOCK_ASSESSMENT: Assessment = {
  risk_percentage: 12.4,
  confidence_low: 8.1,
  confidence_high: 17.8,
  risk_level: "borderline",
  is_preliminary: true,
  data_level: 1,
  next_level_hint: "Add lipid panel (Total Cholesterol, LDL, HDL, Triglycerides) to reach Level 2",
  bmi: 25.8,
  whr: 0.89,
  whtr: 0.51,
  risk_enhancers_count: 2,
  last_updated: "2026-03-15T10:30:00Z",
};

function RiskGauge({
  percentage,
  riskLevel,
}: {
  readonly percentage: number;
  readonly riskLevel: string;
}) {
  const riskColors: Record<string, string> = {
    low: "#22C55E",
    borderline: "#EAB308",
    intermediate: "#F97316",
    high: "#EF4444",
  };

  const color = riskColors[riskLevel] ?? "#6B7280";

  return (
    <View className="items-center py-4">
      {/* Simplified circular gauge representation */}
      <View
        className="w-40 h-40 rounded-full border-8 items-center justify-center"
        style={{ borderColor: color }}
      >
        <Text className="text-4xl font-bold" style={{ color }}>
          {percentage.toFixed(1)}%
        </Text>
        <Text className="text-xs text-text-secondary mt-1">10-Year Risk</Text>
      </View>
    </View>
  );
}

function MetricCard({
  label,
  value,
  unit,
  status,
}: {
  readonly label: string;
  readonly value: string;
  readonly unit: string;
  readonly status: "normal" | "borderline" | "elevated";
}) {
  const statusColors: Record<string, string> = {
    normal: "bg-risk-low-bg border-green-200",
    borderline: "bg-risk-borderline-bg border-yellow-200",
    elevated: "bg-risk-high-bg border-red-200",
  };

  const statusTextColors: Record<string, string> = {
    normal: "text-risk-low",
    borderline: "text-risk-borderline",
    elevated: "text-risk-high",
  };

  return (
    <View
      className={`flex-1 rounded-xl border p-3 ${statusColors[status]}`}
    >
      <Text className="text-xs text-text-secondary mb-1">{label}</Text>
      <View className="flex-row items-baseline">
        <Text className="text-xl font-bold text-text-primary">{value}</Text>
        <Text className="text-xs text-text-secondary ml-1">{unit}</Text>
      </View>
      <Text className={`text-2xs font-medium mt-1 ${statusTextColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const assessment = MOCK_ASSESSMENT;

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 pb-8"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-text-primary">
              Dashboard
            </Text>
            <Text className="text-xs text-text-tertiary">
              Last updated:{" "}
              {new Date(assessment.last_updated).toLocaleDateString()}
            </Text>
          </View>
          <Pressable className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
            <Ionicons name="notifications-outline" size={22} color="#111827" />
          </Pressable>
        </View>

        {/* Risk Gauge */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <RiskGauge
            percentage={assessment.risk_percentage}
            riskLevel={assessment.risk_level}
          />
        </View>

        {/* Confidence Range */}
        <View className="mb-4">
          <ConfidenceRange
            low={assessment.confidence_low}
            high={assessment.confidence_high}
            midpoint={assessment.risk_percentage}
            isPreliminary={assessment.is_preliminary}
            riskLevel={assessment.risk_level}
          />
        </View>

        {/* Completeness Meter */}
        <View className="mb-4">
          <CompletenessMeter
            currentLevel={assessment.data_level}
            nextLevelHint={assessment.next_level_hint}
          />
        </View>

        {/* Body Metrics */}
        <Text className="text-sm font-semibold text-text-primary mb-2 ml-1">
          Body Metrics
        </Text>
        <View className="flex-row gap-3 mb-4">
          <MetricCard
            label="BMI"
            value={assessment.bmi.toFixed(1)}
            unit="kg/m2"
            status="borderline"
          />
          <MetricCard
            label="WHR"
            value={assessment.whr.toFixed(2)}
            unit=""
            status="borderline"
          />
          <MetricCard
            label="WHtR"
            value={assessment.whtr.toFixed(2)}
            unit=""
            status="normal"
          />
        </View>

        {/* Risk Enhancers */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-semibold text-text-primary">
                Risk-Enhancing Factors
              </Text>
              <Text className="text-xs text-text-secondary mt-1">
                {assessment.risk_enhancers_count} factor
                {assessment.risk_enhancers_count !== 1 ? "s" : ""} identified
              </Text>
            </View>
            <View className="bg-amber-100 w-10 h-10 rounded-full items-center justify-center">
              <Text className="text-lg font-bold text-amber-700">
                {assessment.risk_enhancers_count}
              </Text>
            </View>
          </View>
        </View>

        {/* Recommended Tests CTA */}
        <Pressable
          onPress={() => router.push("/(main)/recommendations")}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex-row items-center mb-4 active:bg-blue-100"
        >
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="flask" size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-blue-900">
              See Recommended Tests
            </Text>
            <Text className="text-xs text-blue-700 mt-0.5">
              Improve your estimate by completing key tests
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
        </Pressable>

        {/* Disclaimer */}
        <DisclaimerBanner disclaimerKey="risk" />
      </ScrollView>
    </SafeAreaView>
  );
}
