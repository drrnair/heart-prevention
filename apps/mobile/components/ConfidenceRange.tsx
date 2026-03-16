import React from "react";
import { View, Text } from "react-native";

interface ConfidenceRangeProps {
  readonly low: number;
  readonly high: number;
  readonly midpoint: number;
  readonly isPreliminary: boolean;
  readonly riskLevel: "low" | "borderline" | "intermediate" | "high";
}

const RISK_GRADIENT: Record<string, string> = {
  low: "bg-risk-low",
  borderline: "bg-risk-borderline",
  intermediate: "bg-risk-intermediate",
  high: "bg-risk-high",
};

const RISK_BG: Record<string, string> = {
  low: "bg-risk-low-bg",
  borderline: "bg-risk-borderline-bg",
  intermediate: "bg-risk-intermediate-bg",
  high: "bg-risk-high-bg",
};

const RISK_TEXT: Record<string, string> = {
  low: "text-risk-low",
  borderline: "text-risk-borderline",
  intermediate: "text-risk-intermediate",
  high: "text-risk-high",
};

export function ConfidenceRange({
  low,
  high,
  midpoint,
  isPreliminary,
  riskLevel,
}: ConfidenceRangeProps) {
  const maxScale = Math.max(high * 1.3, 30);
  const leftPercent = (low / maxScale) * 100;
  const widthPercent = ((high - low) / maxScale) * 100;
  const midPercent = (midpoint / maxScale) * 100;

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-semibold text-text-primary">
          10-Year Risk Estimate
        </Text>
        {isPreliminary && (
          <View className="bg-amber-100 rounded-full px-3 py-1">
            <Text className="text-2xs font-bold text-amber-700">
              PRELIMINARY
            </Text>
          </View>
        )}
      </View>

      <Text className={`text-3xl font-bold ${RISK_TEXT[riskLevel]} mb-1`}>
        {midpoint.toFixed(1)}%
      </Text>

      <Text className="text-xs text-text-secondary mb-3">
        Range: {low.toFixed(1)}% - {high.toFixed(1)}%
      </Text>

      {/* Bar visualization */}
      <View className="h-6 bg-gray-100 rounded-full overflow-hidden relative">
        {/* Range bar */}
        <View
          className={`absolute top-0 bottom-0 rounded-full ${RISK_GRADIENT[riskLevel]} opacity-40`}
          style={{
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
          }}
        />
        {/* Midpoint marker */}
        <View
          className={`absolute top-0 bottom-0 w-1 ${RISK_GRADIENT[riskLevel]}`}
          style={{ left: `${midPercent}%` }}
        />
      </View>

      <View className="flex-row justify-between mt-1">
        <Text className="text-2xs text-text-tertiary">0%</Text>
        <Text className="text-2xs text-text-tertiary">
          {Math.round(maxScale)}%
        </Text>
      </View>

      {isPreliminary && (
        <View className={`mt-3 ${RISK_BG[riskLevel]} rounded-xl p-3`}>
          <Text className={`text-xs ${RISK_TEXT[riskLevel]}`}>
            This is a preliminary estimate based on limited data. Upload lab
            results to narrow this range and improve accuracy.
          </Text>
        </View>
      )}
    </View>
  );
}
