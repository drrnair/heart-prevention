import React from 'react';
import { View, Text } from 'react-native';

// ── Props ────────────────────────────────────────────────────────────

export interface MetricCardProps {
  /** Metric label (e.g. "Total Cholesterol"). */
  readonly label: string;
  /** Numeric or string value. */
  readonly value: number | string;
  /** Unit of measurement (e.g. "mg/dL"). */
  readonly unit?: string;
  /** Interpretation text (e.g. "Optimal", "Elevated"). */
  readonly interpretation?: string;
  /** Color for the interpretation badge (NativeWind or hex). */
  readonly interpretationColor?: string;
  /** Trend direction indicator. */
  readonly trend?: 'up' | 'down' | 'stable';
  /** Optional icon character or emoji. */
  readonly icon?: string;
}

// ── Trend arrows ─────────────────────────────────────────────────────

const TREND_CONFIG = {
  up: { symbol: '\u2191', color: '#ef4444', label: 'Increasing' }, // red
  down: { symbol: '\u2193', color: '#22c55e', label: 'Decreasing' }, // green
  stable: { symbol: '\u2192', color: '#6b7280', label: 'Stable' }, // gray
} as const;

// ── Interpretation color mapping ─────────────────────────────────────

function resolveInterpretationStyle(color?: string): {
  bg: string;
  text: string;
} {
  switch (color) {
    case 'green':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'yellow':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'orange':
      return { bg: 'bg-orange-100', text: 'text-orange-700' };
    case 'red':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

// ── Component ────────────────────────────────────────────────────────

export function MetricCard({
  label,
  value,
  unit,
  interpretation,
  interpretationColor,
  trend,
  icon,
}: MetricCardProps): React.JSX.Element {
  const interpStyle = resolveInterpretationStyle(interpretationColor);
  const trendInfo = trend !== undefined ? TREND_CONFIG[trend] : undefined;

  return (
    <View className="bg-white rounded-xl px-4 py-4 my-1.5 shadow-sm border border-gray-100">
      {/* Top row: icon + label + trend */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          {icon !== undefined && (
            <Text className="text-lg mr-2">{icon}</Text>
          )}
          <Text className="text-sm text-gray-500 font-medium" numberOfLines={1}>
            {label}
          </Text>
        </View>

        {trendInfo !== undefined && (
          <View className="flex-row items-center">
            <Text
              className="text-base font-bold mr-0.5"
              style={{ color: trendInfo.color }}
              accessibilityLabel={trendInfo.label}
            >
              {trendInfo.symbol}
            </Text>
            <Text className="text-[10px]" style={{ color: trendInfo.color }}>
              {trendInfo.label}
            </Text>
          </View>
        )}
      </View>

      {/* Value row */}
      <View className="flex-row items-baseline mb-2">
        <Text className="text-3xl font-extrabold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        {unit !== undefined && (
          <Text className="text-sm text-gray-400 ml-1.5 font-medium">
            {unit}
          </Text>
        )}
      </View>

      {/* Interpretation badge */}
      {interpretation !== undefined && interpretation.length > 0 && (
        <View className={`self-start rounded-full px-3 py-1 ${interpStyle.bg}`}>
          <Text className={`text-xs font-semibold ${interpStyle.text}`}>
            {interpretation}
          </Text>
        </View>
      )}
    </View>
  );
}
