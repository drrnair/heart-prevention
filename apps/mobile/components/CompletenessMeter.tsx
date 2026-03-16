import React from "react";
import { View, Text } from "react-native";

interface Level {
  readonly label: string;
  readonly description: string;
}

const LEVELS: readonly Level[] = [
  { label: "L1", description: "Demographics" },
  { label: "L2", description: "Basic Labs" },
  { label: "L3", description: "Extended Labs" },
  { label: "L4", description: "Imaging" },
];

const LEVEL_COLORS = [
  "bg-level-1",
  "bg-level-2",
  "bg-level-3",
  "bg-level-4",
] as const;

const LEVEL_COLORS_INACTIVE = [
  "bg-blue-100",
  "bg-blue-100",
  "bg-blue-100",
  "bg-blue-100",
] as const;

interface CompletenessMeterProps {
  readonly currentLevel: 1 | 2 | 3 | 4;
  readonly nextLevelHint?: string;
}

export function CompletenessMeter({
  currentLevel,
  nextLevelHint,
}: CompletenessMeterProps) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm" accessibilityLabel={`Data completeness level ${currentLevel} of 4. ${nextLevelHint || ''}`}>
      <Text className="text-sm font-semibold text-text-primary mb-3">
        Data Completeness
      </Text>

      <View className="flex-row gap-2 mb-3">
        {LEVELS.map((level, index) => {
          const isFilled = index < currentLevel;
          const colorClass = isFilled
            ? LEVEL_COLORS[index]
            : LEVEL_COLORS_INACTIVE[index];

          return (
            <View key={level.label} className="flex-1">
              <View className={`h-3 rounded-full ${colorClass}`} />
              <Text
                className={`text-2xs text-center mt-1 ${
                  isFilled ? "text-text-primary font-medium" : "text-text-tertiary"
                }`}
              >
                {level.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row justify-between">
        {LEVELS.map((level, index) => (
          <Text
            key={level.label}
            className={`text-2xs flex-1 text-center ${
              index < currentLevel ? "text-text-secondary" : "text-text-tertiary"
            }`}
          >
            {level.description}
          </Text>
        ))}
      </View>

      {currentLevel < 4 && nextLevelHint && (
        <View className="mt-3 bg-blue-50 rounded-xl p-3">
          <Text className="text-xs text-blue-700">
            <Text className="font-semibold">Next level: </Text>
            {nextLevelHint}
          </Text>
        </View>
      )}
    </View>
  );
}
