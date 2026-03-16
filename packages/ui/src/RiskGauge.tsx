import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { RiskCategory } from '@heart/shared';

// ── Props ────────────────────────────────────────────────────────────

export interface RiskGaugeProps {
  /** 10-year risk percentage (0-100). */
  readonly riskPercentage: number;
  /** Risk category label. */
  readonly riskCategory: RiskCategory;
  /** When true, shows a "PRELIMINARY" badge and optional confidence range. */
  readonly isPreliminary?: boolean;
  /** Lower bound of the confidence interval. */
  readonly confidenceLower?: number;
  /** Upper bound of the confidence interval. */
  readonly confidenceUpper?: number;
}

// ── Constants ────────────────────────────────────────────────────────

const SIZE = 200;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CENTER = SIZE / 2;

/** 270-degree arc; starts at 135 degrees (bottom-left), sweeps CW 270 degrees. */
const START_ANGLE_DEG = 135;
const SWEEP_DEG = 270;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Compute the SVG arc path for a given fraction (0-1) of the full sweep. */
function arcPath(fraction: number): string {
  const startRad = toRad(START_ANGLE_DEG);
  const endRad = toRad(START_ANGLE_DEG + SWEEP_DEG * Math.min(fraction, 1));

  const x1 = CENTER + RADIUS * Math.cos(startRad);
  const y1 = CENTER + RADIUS * Math.sin(startRad);
  const x2 = CENTER + RADIUS * Math.cos(endRad);
  const y2 = CENTER + RADIUS * Math.sin(endRad);

  const largeArc = SWEEP_DEG * fraction > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}`;
}

/** Full background track path. */
const TRACK_PATH = arcPath(1);

/** Color mapping based on risk percentage thresholds. */
function riskColor(pct: number): string {
  if (pct < 5) return '#22c55e'; // green-500
  if (pct < 7.5) return '#eab308'; // yellow-500
  if (pct < 20) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

/** Readable label for risk category. */
const CATEGORY_LABELS: Record<RiskCategory, string> = {
  low: 'Low Risk',
  borderline: 'Borderline',
  intermediate: 'Intermediate',
  high: 'High Risk',
};

// ── Animated path wrapper ────────────────────────────────────────────

const AnimatedPath = Animated.createAnimatedComponent(Path);

// ── Component ────────────────────────────────────────────────────────

export function RiskGauge({
  riskPercentage,
  riskCategory,
  isPreliminary = false,
  confidenceLower,
  confidenceUpper,
}: RiskGaugeProps): React.JSX.Element {
  const clampedPct = Math.max(0, Math.min(riskPercentage, 100));
  const color = riskColor(clampedPct);

  // Animate fill from 0 to the target fraction.
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clampedPct / 100, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedPct, progress]);

  const animatedProps = useAnimatedProps(() => ({
    d: arcPath(progress.value),
  }));

  return (
    <View className="items-center py-4">
      {/* Preliminary badge */}
      {isPreliminary && (
        <View className="bg-amber-100 border border-amber-400 rounded-full px-3 py-1 mb-2">
          <Text className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            Preliminary
          </Text>
        </View>
      )}

      {/* SVG gauge */}
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          {/* Background track */}
          <Path
            d={TRACK_PATH}
            stroke="#e5e7eb"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />
          {/* Animated fill arc */}
          <AnimatedPath
            animatedProps={animatedProps}
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />
          {/* Center decorative dot */}
          <Circle cx={CENTER} cy={CENTER} r={3} fill="#d1d5db" />
        </Svg>

        {/* Percentage label overlay */}
        <View
          className="absolute items-center justify-center"
          style={{ top: 0, left: 0, width: SIZE, height: SIZE }}
        >
          <Text
            className="font-extrabold"
            style={{ fontSize: 40, color }}
          >
            {clampedPct.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Confidence range (only for preliminary) */}
      {isPreliminary &&
        confidenceLower !== undefined &&
        confidenceUpper !== undefined && (
          <Text className="text-xs text-gray-500 mt-1">
            Confidence range: {confidenceLower.toFixed(1)}% &ndash;{' '}
            {confidenceUpper.toFixed(1)}%
          </Text>
        )}

      {/* Risk category label */}
      <Text
        className="text-base font-semibold mt-2"
        style={{ color }}
      >
        {CATEGORY_LABELS[riskCategory] ?? riskCategory}
      </Text>
    </View>
  );
}
