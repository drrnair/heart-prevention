import React from 'react';
import { View, Text } from 'react-native';
import type { DataLevel } from '@heart/shared';

// ── Props ────────────────────────────────────────────────────────────

export interface CompletenessLevelProps {
  /** Current data completeness level (1-4). */
  readonly currentLevel: DataLevel;
  /** Fields needed to reach the next level. */
  readonly missingForNext?: readonly string[];
}

// ── Level metadata ───────────────────────────────────────────────────

interface LevelMeta {
  readonly level: DataLevel;
  readonly label: string;
  readonly shortLabel: string;
}

const LEVELS: readonly LevelMeta[] = [
  { level: 1, label: 'Demographics', shortLabel: 'L1' },
  { level: 2, label: 'Basic Labs', shortLabel: 'L2' },
  { level: 3, label: 'Extended Labs', shortLabel: 'L3' },
  { level: 4, label: 'Imaging', shortLabel: 'L4' },
] as const;

const FILLED_COLORS: Record<DataLevel, string> = {
  1: 'bg-blue-400',
  2: 'bg-blue-500',
  3: 'bg-indigo-500',
  4: 'bg-violet-600',
};

// ── Component ────────────────────────────────────────────────────────

export function CompletenessLevel({
  currentLevel,
  missingForNext = [],
}: CompletenessLevelProps): React.JSX.Element {
  const percentage = (currentLevel / 4) * 100;
  const nextLevel = currentLevel < 4 ? ((currentLevel + 1) as DataLevel) : undefined;

  return (
    <View className="bg-white rounded-xl px-4 py-4 my-2 shadow-sm border border-gray-100">
      {/* Header row */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-semibold text-gray-700">
          Data Completeness
        </Text>
        <View className="bg-blue-50 rounded-full px-2 py-0.5">
          <Text className="text-xs font-bold text-blue-700">
            {percentage.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Segment bar */}
      <View className="flex-row gap-1.5 mb-2">
        {LEVELS.map((meta) => {
          const isFilled = meta.level <= currentLevel;
          return (
            <View
              key={meta.level}
              className={`flex-1 h-3 rounded-full ${isFilled ? (FILLED_COLORS[meta.level] ?? 'bg-blue-400') : 'bg-gray-200'}`}
            />
          );
        })}
      </View>

      {/* Labels */}
      <View className="flex-row mb-3">
        {LEVELS.map((meta) => {
          const isFilled = meta.level <= currentLevel;
          return (
            <View key={meta.level} className="flex-1 items-center">
              <Text
                className={`text-[10px] font-medium ${isFilled ? 'text-gray-800' : 'text-gray-400'}`}
                numberOfLines={1}
              >
                {meta.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Missing items for next level */}
      {nextLevel !== undefined && missingForNext.length > 0 && (
        <View className="bg-gray-50 rounded-lg px-3 py-2 mt-1">
          <Text className="text-xs text-gray-500 mb-1">
            To reach Level {nextLevel}, add:
          </Text>
          <Text className="text-xs font-medium text-gray-700">
            {missingForNext.join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
}
