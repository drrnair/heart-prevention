import React from 'react';
import { View, Text } from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryAxis,
  VictoryArea,
  VictoryTheme,
  VictoryLabel,
} from 'victory-native';
import type { DataLevel } from '@heart/shared';

// ── Props ────────────────────────────────────────────────────────────

export interface TrendDataPoint {
  /** ISO date string. */
  readonly date: string;
  /** Numeric metric value. */
  readonly value: number;
  /** Data level at which this point was recorded. */
  readonly level?: DataLevel;
}

export interface TrendChartProps {
  /** Time-series data points (oldest first). */
  readonly data: readonly TrendDataPoint[];
  /** Chart title. */
  readonly title: string;
  /** Unit label for the y-axis. */
  readonly unit: string;
  /** Optional reference range shown as a shaded band. */
  readonly referenceRange?: { readonly min: number; readonly max: number };
}

// ── Helpers ──────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<DataLevel, string> = {
  1: '#60a5fa', // blue-400
  2: '#3b82f6', // blue-500
  3: '#6366f1', // indigo-500
  4: '#7c3aed', // violet-600
};

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = String(d.getFullYear()).slice(2);
  return `${month} '${year}`;
}

// ── Level badge (rendered below the chart as a legend) ──────────────

function LevelBadge({
  level,
}: {
  readonly level: DataLevel;
}): React.JSX.Element {
  return (
    <View
      className="rounded-full px-1.5 py-0.5 mr-1"
      style={{ backgroundColor: LEVEL_COLORS[level] ?? '#3b82f6' }}
    >
      <Text className="text-[9px] font-bold text-white">
        L{level}
      </Text>
    </View>
  );
}

// ── Component ────────────────────────────────────────────────────────

export function TrendChart({
  data,
  title,
  unit,
  referenceRange,
}: TrendChartProps): React.JSX.Element {
  // Guard: empty data
  if (data.length === 0) {
    return (
      <View className="bg-white rounded-xl px-2 py-3 my-2 shadow-sm border border-gray-100">
        <View className="flex-row items-baseline px-2 mb-1">
          <Text className="text-sm font-semibold text-gray-800">{title}</Text>
          <Text className="text-xs text-gray-400 ml-1">({unit})</Text>
        </View>
        <View className="items-center justify-center py-8">
          <Text className="text-sm text-gray-400">No data available</Text>
        </View>
      </View>
    );
  }

  // Transform data for Victory.
  const chartData = data.map((pt, idx) => ({
    x: idx,
    y: pt.value,
    label: pt.level !== undefined ? `L${pt.level}` : '',
    date: pt.date,
    level: pt.level,
  }));

  const isSinglePoint = chartData.length === 1;

  // Compute domain padding.
  const yValues = data.map((d) => d.value);
  const yMin = Math.min(...yValues, referenceRange?.min ?? Infinity);
  const yMax = Math.max(...yValues, referenceRange?.max ?? -Infinity);
  // When all values are identical, provide a minimum padding
  const yPad = yMax === yMin ? 5 : (yMax - yMin) * 0.15;

  // Reference range area data.
  const refAreaData =
    referenceRange !== undefined
      ? chartData.map((pt) => ({
          x: pt.x,
          y: referenceRange.max,
          y0: referenceRange.min,
        }))
      : undefined;

  return (
    <View className="bg-white rounded-xl px-2 py-3 my-2 shadow-sm border border-gray-100">
      {/* Title */}
      <View className="flex-row items-baseline px-2 mb-1">
        <Text className="text-sm font-semibold text-gray-800">{title}</Text>
        <Text className="text-xs text-gray-400 ml-1">({unit})</Text>
      </View>

      {/* Chart */}
      <VictoryChart
        theme={VictoryTheme.material}
        height={200}
        padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
        domainPadding={{ y: [yPad, yPad] }}
      >
        {/* X axis */}
        <VictoryAxis
          tickFormat={(_: unknown, idx: number) => {
            const pt = chartData[idx];
            return pt !== undefined ? formatDateLabel(pt.date) : '';
          }}
          style={{
            tickLabels: { fontSize: 9, fill: '#9ca3af' },
            grid: { stroke: 'none' },
          }}
        />

        {/* Y axis */}
        <VictoryAxis
          dependentAxis
          style={{
            tickLabels: { fontSize: 9, fill: '#9ca3af' },
            grid: { stroke: '#f3f4f6', strokeDasharray: '4,4' },
          }}
        />

        {/* Reference range band */}
        {refAreaData !== undefined && (
          <VictoryArea
            data={refAreaData}
            style={{
              data: { fill: '#d1fae5', opacity: 0.5, stroke: 'none' },
            }}
          />
        )}

        {/* Trend line (hide for single data point) */}
        {!isSinglePoint && (
          <VictoryLine
            data={chartData}
            style={{
              data: { stroke: '#3b82f6', strokeWidth: 2 },
            }}
          />
        )}

        {/* Data points with level labels (larger dot for single point) */}
        <VictoryScatter
          data={chartData}
          size={isSinglePoint ? 8 : 5}
          style={{
            data: {
              fill: ({ datum }: { datum: { level?: DataLevel } }) =>
                datum.level !== undefined
                  ? (LEVEL_COLORS[datum.level] ?? '#3b82f6')
                  : '#3b82f6',
              stroke: '#ffffff',
              strokeWidth: 2,
            },
          }}
          labels={({ datum }: { datum: { label: string } }) => datum.label}
          labelComponent={
            <VictoryLabel
              dy={-12}
              style={{ fontSize: 8, fill: '#6b7280', fontWeight: 'bold' }}
            />
          }
        />
      </VictoryChart>

      {/* Legend */}
      <View className="flex-row items-center justify-center mt-1">
        {([1, 2, 3, 4] as const).map((level) => (
          <View key={level} className="flex-row items-center mr-3">
            <LevelBadge level={level} />
            <Text className="text-[9px] text-gray-500">
              {level === 1
                ? 'Demographics'
                : level === 2
                  ? 'Basic'
                  : level === 3
                    ? 'Extended'
                    : 'Imaging'}
            </Text>
          </View>
        ))}

        {referenceRange !== undefined && (
          <View className="flex-row items-center ml-2">
            <View className="w-3 h-2 rounded-sm bg-emerald-200 mr-1" />
            <Text className="text-[9px] text-gray-500">Normal</Text>
          </View>
        )}
      </View>
    </View>
  );
}
