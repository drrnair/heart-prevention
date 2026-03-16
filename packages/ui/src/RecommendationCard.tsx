import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type {
  InvestigationRecommendation,
  RecommendationPriority,
  RecommendationStatus,
} from '@heart/shared';

// ── Props ────────────────────────────────────────────────────────────

export interface RecommendationCardProps {
  /** The investigation recommendation to display. */
  readonly recommendation: InvestigationRecommendation;
  /** Callback when the user takes an action (schedule, complete, decline, snooze). */
  readonly onAction: (id: string, status: RecommendationStatus) => void;
}

// ── Priority styling ─────────────────────────────────────────────────

const PRIORITY_STYLES: Record<
  RecommendationPriority,
  { border: string; badge: string; badgeText: string; label: string }
> = {
  routine: {
    border: 'border-gray-300',
    badge: 'bg-gray-100',
    badgeText: 'text-gray-600',
    label: 'Routine',
  },
  recommended: {
    border: 'border-blue-400',
    badge: 'bg-blue-100',
    badgeText: 'text-blue-700',
    label: 'Recommended',
  },
  strongly_recommended: {
    border: 'border-orange-400',
    badge: 'bg-orange-100',
    badgeText: 'text-orange-700',
    label: 'Strongly Recommended',
  },
};

// ── Category label mapping ───────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  basic_labs: 'Basic Labs',
  extended_lipids: 'Extended Lipids',
  inflammatory: 'Inflammatory',
  metabolic: 'Metabolic',
  imaging: 'Imaging',
};

// ── Test code to human-readable name ─────────────────────────────────

const TEST_NAMES: Record<string, string> = {
  lipid_panel: 'Lipid Panel',
  lpa: 'Lipoprotein(a)',
  apob: 'ApoB',
  hba1c: 'HbA1c',
  hs_crp: 'hs-CRP',
  cac_score: 'Coronary Calcium Score',
  ctca: 'CT Coronary Angiography',
  abi: 'Ankle-Brachial Index',
  fasting_glucose: 'Fasting Glucose',
  egfr: 'eGFR',
  advanced_lipid_panel: 'Advanced Lipid Panel',
  homocysteine: 'Homocysteine',
  nt_pro_bnp: 'NT-proBNP',
  tsh: 'TSH',
  vitamin_d: 'Vitamin D',
  cbc: 'Complete Blood Count',
  hepatic_panel: 'Hepatic Panel',
  renal_panel: 'Renal Panel',
  fasting_insulin: 'Fasting Insulin',
  uric_acid: 'Uric Acid',
  carotid_ultrasound: 'Carotid Ultrasound',
  echocardiogram: 'Echocardiogram',
};

// ── Impact indicator ─────────────────────────────────────────────────

function ImpactIndicator({
  priority,
}: {
  readonly priority: RecommendationPriority;
}): React.JSX.Element {
  const dotCount =
    priority === 'strongly_recommended' ? 3 : priority === 'recommended' ? 2 : 1;
  const dotColor =
    priority === 'strongly_recommended'
      ? 'bg-orange-500'
      : priority === 'recommended'
        ? 'bg-blue-500'
        : 'bg-gray-400';

  return (
    <View className="flex-row items-center">
      <Text className="text-[10px] text-gray-400 mr-1">Impact</Text>
      {Array.from({ length: 3 }).map((_, i) => (
        <View
          key={i}
          className={`w-2 h-2 rounded-full mr-0.5 ${i < dotCount ? dotColor : 'bg-gray-200'}`}
        />
      ))}
    </View>
  );
}

// ── Action button ────────────────────────────────────────────────────

interface ActionButtonProps {
  readonly label: string;
  readonly bgClass: string;
  readonly textClass: string;
  readonly onPress: () => void;
}

function ActionButton({
  label,
  bgClass,
  textClass,
  onPress,
}: ActionButtonProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-lg px-3 py-2 mr-2 mb-1 ${bgClass}`}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text className={`text-xs font-semibold ${textClass}`}>{label}</Text>
    </Pressable>
  );
}

// ── Component ────────────────────────────────────────────────────────

export function RecommendationCard({
  recommendation,
  onAction,
}: RecommendationCardProps): React.JSX.Element {
  const { id, testCode, testCategory, priority, rationale, status } =
    recommendation;

  const priorityStyle = PRIORITY_STYLES[priority];
  const testName = TEST_NAMES[testCode] ?? testCode;
  const categoryLabel = CATEGORY_LABELS[testCategory] ?? testCategory;

  // Don't render action buttons for terminal statuses.
  const showActions = status === 'pending' || status === 'snoozed';

  return (
    <View
      className={`bg-white rounded-xl px-4 py-4 my-2 border-l-4 shadow-sm border border-gray-100 ${priorityStyle.border}`}
    >
      {/* Header: test name + category badge */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-base font-bold text-gray-900">{testName}</Text>
        </View>
        <View className={`rounded-full px-2 py-0.5 ${priorityStyle.badge}`}>
          <Text className={`text-[10px] font-semibold ${priorityStyle.badgeText}`}>
            {priorityStyle.label}
          </Text>
        </View>
      </View>

      {/* Category label */}
      <View className="bg-gray-50 self-start rounded-md px-2 py-0.5 mb-2">
        <Text className="text-[10px] text-gray-500 font-medium">
          {categoryLabel}
        </Text>
      </View>

      {/* Rationale */}
      <Text className="text-sm text-gray-700 leading-5 mb-2">
        {rationale}
      </Text>

      {/* Guideline citation placeholder (styled for when rationale includes one) */}
      {rationale.includes('guideline') || rationale.includes('AHA') || rationale.includes('ACC') ? (
        <Text className="text-xs text-gray-400 italic mb-2">
          Based on published clinical guidelines
        </Text>
      ) : null}

      {/* Impact indicator */}
      <View className="mb-3">
        <ImpactIndicator priority={priority} />
      </View>

      {/* Action buttons */}
      {showActions && (
        <View className="flex-row flex-wrap">
          <ActionButton
            label="Schedule"
            bgClass="bg-blue-500"
            textClass="text-white"
            onPress={() => onAction(id, 'scheduled')}
          />
          <ActionButton
            label="Mark Complete"
            bgClass="bg-green-500"
            textClass="text-white"
            onPress={() => onAction(id, 'completed')}
          />
          <ActionButton
            label="Decline"
            bgClass="bg-gray-200"
            textClass="text-gray-700"
            onPress={() => onAction(id, 'declined')}
          />
          <ActionButton
            label="Snooze"
            bgClass="bg-amber-100"
            textClass="text-amber-700"
            onPress={() => onAction(id, 'snoozed')}
          />
        </View>
      )}

      {/* Status badge for non-pending states */}
      {!showActions && (
        <View className="bg-gray-100 self-start rounded-full px-3 py-1">
          <Text className="text-xs font-medium text-gray-600 capitalize">
            {status}
          </Text>
        </View>
      )}
    </View>
  );
}
