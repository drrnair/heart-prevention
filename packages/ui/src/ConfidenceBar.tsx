import React from 'react';
import { View, Text } from 'react-native';

// ── Props ────────────────────────────────────────────────────────────

export interface ConfidenceBarProps {
  /** Lower bound of the confidence interval. */
  readonly lower: number;
  /** Upper bound of the confidence interval. */
  readonly upper: number;
  /** Point estimate (midpoint). */
  readonly midpoint: number;
  /** Optional label displayed above the bar. */
  readonly label?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Maps a risk percentage to a color pair [bar color, lighter background]. */
function riskColorPair(pct: number): { bar: string; bg: string } {
  if (pct < 5) return { bar: '#22c55e', bg: '#dcfce7' }; // green
  if (pct < 7.5) return { bar: '#eab308', bg: '#fef9c3' }; // yellow
  if (pct < 20) return { bar: '#f97316', bg: '#ffedd5' }; // orange
  return { bar: '#ef4444', bg: '#fee2e2' }; // red
}

// ── Component ────────────────────────────────────────────────────────

export function ConfidenceBar({
  lower,
  upper,
  midpoint,
  label,
}: ConfidenceBarProps): React.JSX.Element {
  // Compute visual positions as percentages of a 0-max scale.
  // We pad the scale slightly beyond the range for visual breathing room.
  const scaleMin = 0;
  const scaleMax = Math.max(upper * 1.25, 30); // at least 30 for very low ranges
  const range = scaleMax - scaleMin;

  const toPercent = (v: number) =>
    Math.max(0, Math.min(100, ((v - scaleMin) / range) * 100));

  const lowerPct = toPercent(lower);
  const upperPct = toPercent(upper);
  const midPct = toPercent(midpoint);
  const barWidth = Math.max(upperPct - lowerPct, 2);

  const colors = riskColorPair(midpoint);

  return (
    <View className="my-3">
      {/* Label */}
      {label !== undefined && label.length > 0 && (
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          {label}
        </Text>
      )}

      {/* Numeric labels row */}
      <View className="flex-row justify-between mb-1 px-1">
        <Text className="text-[10px] text-gray-500">0%</Text>
        <Text className="text-[10px] text-gray-500">
          {scaleMax.toFixed(0)}%
        </Text>
      </View>

      {/* Bar track */}
      <View
        className="h-5 rounded-full overflow-hidden"
        style={{ backgroundColor: '#f3f4f6' }}
      >
        {/* Confidence range bar */}
        <View
          className="absolute h-5 rounded-full"
          style={{
            left: `${lowerPct}%`,
            width: `${barWidth}%`,
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: colors.bar,
          }}
        />

        {/* Midpoint diamond marker */}
        <View
          className="absolute items-center justify-center"
          style={{
            left: `${midPct}%`,
            top: -2,
            width: 24,
            height: 24,
            marginLeft: -12,
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              backgroundColor: colors.bar,
              transform: [{ rotate: '45deg' }],
              borderRadius: 2,
            }}
          />
        </View>
      </View>

      {/* Value labels */}
      <View className="flex-row justify-between mt-2 px-1">
        <Text className="text-xs font-medium text-gray-600">
          {lower.toFixed(1)}%
        </Text>
        <Text className="text-xs font-bold" style={{ color: colors.bar }}>
          {midpoint.toFixed(1)}%
        </Text>
        <Text className="text-xs font-medium text-gray-600">
          {upper.toFixed(1)}%
        </Text>
      </View>
    </View>
  );
}
