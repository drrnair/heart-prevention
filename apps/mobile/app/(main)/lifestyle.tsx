import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useLifestyle } from "@/hooks/useLifestyle";
import { useUnits } from "@/hooks/useUnits";

type LifestyleTab =
  | "summary"
  | "nutrition"
  | "exercise"
  | "supplements"
  | "monitoring"
  | "targets";

const TABS: readonly { readonly key: LifestyleTab; readonly label: string }[] = [
  { key: "summary", label: "Summary" },
  { key: "nutrition", label: "Nutrition" },
  { key: "exercise", label: "Exercise" },
  { key: "supplements", label: "Supplements" },
  { key: "monitoring", label: "Monitoring" },
  { key: "targets", label: "Targets" },
];

const GENERATING_MESSAGES: readonly string[] = [
  "Analysing your profile...",
  "Creating nutrition plan...",
  "Designing exercise programme...",
  "Reviewing supplements...",
  "Setting monitoring schedule...",
];

const EVIDENCE_COLORS: Record<string, { readonly bg: string; readonly text: string }> = {
  strong: { bg: "bg-green-100", text: "text-green-700" },
  moderate: { bg: "bg-blue-100", text: "text-blue-700" },
  limited: { bg: "bg-amber-100", text: "text-amber-700" },
};

function ExpandableSection({
  title,
  children,
  defaultExpanded = false,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
  readonly defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View className="bg-white rounded-2xl shadow-sm mb-3 overflow-hidden">
      <Pressable
        onPress={() => setIsExpanded((prev) => !prev)}
        className="flex-row items-center justify-between p-4"
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${isExpanded ? 'collapse' : 'expand'} section`}
      >
        <Text className="text-sm font-semibold text-text-primary">
          {title}
        </Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={18}
          color="#9CA3AF"
        />
      </Pressable>
      {isExpanded && (
        <View className="px-4 pb-4 border-t border-gray-100 pt-3">
          {children}
        </View>
      )}
    </View>
  );
}

function BulletItem({ text }: { readonly text: string }) {
  return (
    <View className="flex-row items-start mb-2">
      <View className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-1.5 mr-3" />
      <Text className="flex-1 text-sm text-text-secondary leading-5">
        {text}
      </Text>
    </View>
  );
}

function renderStringArray(items: unknown): React.ReactNode {
  if (!Array.isArray(items)) return null;
  return items.map((item, i) => (
    <BulletItem key={i} text={String(item)} />
  ));
}

export default function LifestyleScreen() {
  const [activeTab, setActiveTab] = useState<LifestyleTab>("summary");
  const { plan, planData, isLoading, error, generate, isGenerating, refetch } =
    useLifestyle();
  const { formatChol, formatTG, formatGlucose, formatWeight, formatWaist, cholUnit, weightUnit } = useUnits();
  const [generatingMessage, setGeneratingMessage] = useState(GENERATING_MESSAGES[0]);
  const messageIndex = useRef(0);

  useEffect(() => {
    if (!isGenerating) return;
    messageIndex.current = 0;
    setGeneratingMessage(GENERATING_MESSAGES[0]);

    const interval = setInterval(() => {
      messageIndex.current =
        (messageIndex.current + 1) % GENERATING_MESSAGES.length;
      setGeneratingMessage(GENERATING_MESSAGES[messageIndex.current]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleRegenerate = () => {
    Alert.alert(
      "Regenerate Plan",
      "This will create a new lifestyle plan based on your current profile. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Regenerate", onPress: generate },
      ],
    );
  };

  if (isLoading && !plan) {
    return (
      <SafeAreaView className="flex-1 bg-surface-secondary">
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  if (error && !plan) {
    return (
      <SafeAreaView className="flex-1 bg-surface-secondary">
        <ErrorBanner message={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (isGenerating) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="text-lg font-semibold text-text-primary mt-6">
          {generatingMessage}
        </Text>
        <Text className="text-sm text-text-secondary mt-2 text-center">
          Creating your personalised 12-week plan based on your health data and guidelines.
        </Text>
      </SafeAreaView>
    );
  }

  if (!plan || !planData) {
    return (
      <SafeAreaView className="flex-1 bg-surface-secondary">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="heart" size={40} color="#DC2626" />
          </View>
          <Text className="text-xl font-bold text-text-primary mb-2 text-center">
            Your Personalised Plan
          </Text>
          <Text className="text-sm text-text-secondary text-center mb-6">
            Generate a personalised 12-week lifestyle plan based on your health
            data and current guidelines.
          </Text>
          <Pressable
            onPress={generate}
            className="bg-primary-600 px-8 py-3 rounded-xl active:bg-primary-700"
            accessibilityRole="button"
            accessibilityLabel="Generate your lifestyle plan"
          >
            <Text className="text-white font-semibold text-base">
              Generate Your Plan
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const nutrition = planData.nutrition as Record<string, unknown>;
  const exercise = planData.exercise as Record<string, unknown>;
  const supplements = planData.supplements as Record<string, unknown>;
  const monitoring = planData.monitoring as Record<string, unknown>;
  const targets = planData.targets as Record<string, unknown>;

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-text-primary">
            Lifestyle Plan
          </Text>
          <View className="bg-primary-100 rounded-full px-3 py-1">
            <Text className="text-2xs font-medium text-primary-700">
              Generated for your profile
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerClassName="gap-2"
        >
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full ${
                activeTab === tab.key
                  ? "bg-primary-600"
                  : "bg-white border border-gray-200"
              }`}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab.key }}
              accessibilityLabel={tab.label}
            >
              <Text
                className={`text-sm font-medium ${
                  activeTab === tab.key ? "text-white" : "text-text-secondary"
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {activeTab === "summary" && (
          <>
            <ExpandableSection title="Clinical Summary" defaultExpanded>
              <Text className="text-sm text-text-secondary leading-5">
                {planData.clinicalSummary}
              </Text>
            </ExpandableSection>

            {targets && typeof targets === "object" && (
              <ExpandableSection title="Key Targets" defaultExpanded>
                {Object.entries(targets).map(([key, val]) => (
                  <BulletItem key={key} text={`${key}: ${String(val)}`} />
                ))}
              </ExpandableSection>
            )}
          </>
        )}

        {activeTab === "nutrition" && (
          <>
            {nutrition.principles && (
              <ExpandableSection title="Dietary Principles" defaultExpanded>
                {renderStringArray(nutrition.principles)}
              </ExpandableSection>
            )}
            {nutrition.heartHealthyFoods && (
              <ExpandableSection title="Heart-Healthy Foods to Prioritise">
                {renderStringArray(nutrition.heartHealthyFoods)}
              </ExpandableSection>
            )}
            {nutrition.foodsToLimit && (
              <ExpandableSection title="Foods to Limit">
                {renderStringArray(nutrition.foodsToLimit)}
              </ExpandableSection>
            )}
          </>
        )}

        {activeTab === "exercise" && (
          <>
            {exercise.aerobic && (
              <ExpandableSection title="Aerobic Exercise" defaultExpanded>
                {renderStringArray(exercise.aerobic)}
              </ExpandableSection>
            )}
            {exercise.strength && (
              <ExpandableSection title="Strength Training">
                {renderStringArray(exercise.strength)}
              </ExpandableSection>
            )}
            {exercise.flexibility && (
              <ExpandableSection title="Flexibility & Balance">
                {renderStringArray(exercise.flexibility)}
              </ExpandableSection>
            )}
            {exercise.weeklySchedule && Array.isArray(exercise.weeklySchedule) && (
              <ExpandableSection title="Weekly Schedule">
                <View className="gap-2">
                  {(exercise.weeklySchedule as readonly { readonly day: string; readonly activity: string }[]).map(
                    (item) => (
                      <View
                        key={item.day}
                        className="flex-row items-center py-2 border-b border-gray-50"
                      >
                        <Text className="w-10 text-xs font-semibold text-primary-600">
                          {item.day}
                        </Text>
                        <Text className="flex-1 text-sm text-text-secondary">
                          {item.activity}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              </ExpandableSection>
            )}
          </>
        )}

        {activeTab === "supplements" && (
          <>
            {supplements.recommended && Array.isArray(supplements.recommended) && (
              <ExpandableSection title="Evidence-Based Considerations" defaultExpanded>
                {(supplements.recommended as readonly Record<string, unknown>[]).map(
                  (sup, i) => {
                    const tier = String(sup.evidenceTier ?? "moderate");
                    const colors = EVIDENCE_COLORS[tier] ?? EVIDENCE_COLORS.moderate;
                    return (
                      <View key={i} className="mb-3">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-sm font-medium text-text-primary">
                            {String(sup.name ?? "")}
                          </Text>
                          <View className={`${colors.bg} rounded-full px-2 py-0.5`}>
                            <Text className={`text-2xs font-medium ${colors.text}`}>
                              {tier}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-xs text-text-secondary">
                          {String(sup.rationale ?? "")}
                        </Text>
                      </View>
                    );
                  },
                )}
              </ExpandableSection>
            )}
            {supplements.notRecommended && (
              <ExpandableSection title="Not Recommended">
                {renderStringArray(supplements.notRecommended)}
              </ExpandableSection>
            )}
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2">
              <Text className="text-xs text-amber-800">
                Always discuss supplements with your healthcare provider,
                especially if taking medications. Some supplements can interact
                with statins and blood pressure medications.
              </Text>
            </View>
          </>
        )}

        {activeTab === "monitoring" && (
          <>
            {monitoring.weekly && (
              <ExpandableSection title="Weekly Checks" defaultExpanded>
                {renderStringArray(monitoring.weekly)}
              </ExpandableSection>
            )}
            {monitoring.monthly && (
              <ExpandableSection title="Monthly Reviews">
                {renderStringArray(monitoring.monthly)}
              </ExpandableSection>
            )}
            {monitoring.quarterly && (
              <ExpandableSection title="Quarterly Lab Work">
                {renderStringArray(monitoring.quarterly)}
              </ExpandableSection>
            )}
          </>
        )}

        {activeTab === "targets" && targets && typeof targets === "object" && (
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
            <Text className="text-sm font-semibold text-text-primary mb-3">
              Your Personalised Targets
            </Text>
            {Object.entries(targets).map(([label, value]) => {
              const targetObj = value as Record<string, unknown> | null;
              const rawCurrent = targetObj?.current != null ? String(targetObj.current) : "—";
              const rawTarget = targetObj?.target != null ? String(targetObj.target) : "—";

              // Format values based on target label
              const lowerLabel = label.toLowerCase();
              const isLipid = /\b(ldl|hdl|cholesterol|non.?hdl)\b/i.test(lowerLabel);
              const isTrig = /\btriglyceride/i.test(lowerLabel);
              const isGluc = /\bglucose\b/i.test(lowerLabel);
              const isWeight = /\bweight\b/i.test(lowerLabel);
              const isWaist = /\bwaist\b/i.test(lowerLabel);

              const formatNumericValue = (raw: string): string => {
                const prefix = raw.match(/^[<>]/)?.[0] ?? "";
                const num = parseFloat(raw.replace(/^[<>]/, ""));
                if (isNaN(num)) return raw;
                if (isLipid) return `${prefix}${formatChol(num).split(" ")[0]}`;
                if (isTrig) return `${prefix}${formatTG(num).split(" ")[0]}`;
                if (isGluc) return `${prefix}${formatGlucose(num).split(" ")[0]}`;
                if (isWeight) return formatWeight(num);
                if (isWaist) return formatWaist(num);
                return raw;
              };

              const current = formatNumericValue(rawCurrent);
              const target = formatNumericValue(rawTarget);

              // Use raw values for on-target comparison (before unit conversion)
              const currentNum = parseFloat(rawCurrent.replace(/^[<>]/, ""));
              const targetStr = rawTarget.replace(/[<>]/g, "");
              const targetNum = parseFloat(targetStr);
              const isOnTarget = isNaN(currentNum) || isNaN(targetNum)
                ? false
                : rawTarget.startsWith("<")
                  ? currentNum < targetNum
                  : rawTarget.startsWith(">")
                    ? currentNum > targetNum
                    : currentNum === targetNum;

              return (
                <View
                  key={label}
                  className="flex-row items-center justify-between py-3 border-b border-gray-50"
                >
                  <Text className="text-sm text-text-primary flex-1">
                    {label}
                  </Text>
                  <Text className="text-sm font-medium text-text-primary w-16 text-right">
                    {current}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color="#9CA3AF"
                    style={{ marginHorizontal: 8 }}
                  />
                  <Text className="text-sm font-medium text-primary-600 w-16 text-right">
                    {target}
                  </Text>
                  <View className="ml-3">
                    <Ionicons
                      name={
                        isOnTarget
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={18}
                      color={isOnTarget ? "#22C55E" : "#D1D5DB"}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Pressable
          onPress={handleRegenerate}
          disabled={isGenerating}
          className="flex-row items-center justify-center h-10 border border-gray-200 rounded-xl mt-2 active:bg-gray-50"
          accessibilityRole="button"
          accessibilityLabel="Regenerate lifestyle plan"
          style={{ minHeight: 44 }}
        >
          <Ionicons name="refresh" size={16} color="#6B7280" />
          <Text className="ml-2 text-sm text-text-secondary font-medium">
            Regenerate Plan
          </Text>
        </Pressable>

        <DisclaimerBanner disclaimerKey="lifestyle" />
      </ScrollView>
    </SafeAreaView>
  );
}
