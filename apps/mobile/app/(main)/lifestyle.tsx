import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

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

export default function LifestyleScreen() {
  const [activeTab, setActiveTab] = useState<LifestyleTab>("summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(true);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setHasGenerated(true);
    setIsGenerating(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 pb-8"
      >
        {/* Header */}
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

        {/* Tab Bar */}
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

        {/* Generate Button (if not generated) */}
        {!hasGenerated && (
          <Pressable
            onPress={handleGenerate}
            disabled={isGenerating}
            className="bg-primary-600 h-12 rounded-xl items-center justify-center mb-4 active:bg-primary-700"
          >
            {isGenerating ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text className="text-white font-semibold">Generating...</Text>
              </View>
            ) : (
              <Text className="text-white font-semibold">
                Generate Lifestyle Plan
              </Text>
            )}
          </Pressable>
        )}

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <>
            <ExpandableSection title="Key Priorities" defaultExpanded>
              <BulletItem text="Reduce LDL cholesterol through dietary changes (currently 142 mg/dL, target <100)" />
              <BulletItem text="Increase aerobic exercise to 150 min/week moderate intensity" />
              <BulletItem text="Lower systolic blood pressure through sodium reduction and DASH-style eating" />
              <BulletItem text="Improve HDL through regular exercise and healthy fats" />
            </ExpandableSection>

            <ExpandableSection title="Weekly Schedule at a Glance" defaultExpanded>
              <View className="gap-2">
                {[
                  { day: "Mon", activity: "Brisk walk 30 min + Upper body strength" },
                  { day: "Tue", activity: "Yoga/Stretching 30 min" },
                  { day: "Wed", activity: "Brisk walk 30 min + Lower body strength" },
                  { day: "Thu", activity: "Rest or gentle walk" },
                  { day: "Fri", activity: "Brisk walk 30 min + Core strength" },
                  { day: "Sat", activity: "Swimming or cycling 45 min" },
                  { day: "Sun", activity: "Rest or light activity" },
                ].map((item) => (
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
                ))}
              </View>
            </ExpandableSection>
          </>
        )}

        {/* Nutrition Tab */}
        {activeTab === "nutrition" && (
          <>
            <ExpandableSection title="Dietary Approach" defaultExpanded>
              <BulletItem text="Follow a Mediterranean / South Indian-adapted dietary pattern" />
              <BulletItem text="Emphasize whole grains (brown rice, millets, oats), legumes, and vegetables" />
              <BulletItem text="Limit refined carbs, added sugars, and processed foods" />
              <BulletItem text="Use cold-pressed groundnut or sesame oil in moderation" />
            </ExpandableSection>

            <ExpandableSection title="Heart-Healthy Foods to Prioritize">
              <BulletItem text="Fatty fish 2-3 times per week (sardines, mackerel, salmon)" />
              <BulletItem text="Nuts & seeds daily - almonds, walnuts, flaxseeds (30g/day)" />
              <BulletItem text="Legumes daily - dal, chickpeas, kidney beans" />
              <BulletItem text="Colorful vegetables - 5+ servings daily" />
              <BulletItem text="Fruits - 2-3 servings daily, especially berries" />
            </ExpandableSection>

            <ExpandableSection title="Foods to Limit">
              <BulletItem text="Sodium: <2300 mg/day (reduce pickles, papads, processed snacks)" />
              <BulletItem text="Saturated fat: <7% of calories (reduce ghee, coconut oil, full-fat dairy)" />
              <BulletItem text="Trans fats: eliminate completely (no vanaspati, margarine)" />
              <BulletItem text="Added sugars: <25g/day" />
              <BulletItem text="Alcohol: if consumed, limit to 1 drink/day" />
            </ExpandableSection>
          </>
        )}

        {/* Exercise Tab */}
        {activeTab === "exercise" && (
          <>
            <ExpandableSection title="Aerobic Exercise" defaultExpanded>
              <BulletItem text="Target: 150 minutes moderate-intensity per week" />
              <BulletItem text="Brisk walking: 30 min, 5 days/week at pace where you can talk but not sing" />
              <BulletItem text="Alternative: swimming, cycling, or dancing" />
              <BulletItem text="Progress gradually - start with 15-20 min if currently sedentary" />
            </ExpandableSection>

            <ExpandableSection title="Strength Training">
              <BulletItem text="2-3 sessions per week, all major muscle groups" />
              <BulletItem text="Can use resistance bands (based on your available equipment)" />
              <BulletItem text="8-12 repetitions, 2-3 sets per exercise" />
              <BulletItem text="Include: squats, lunges, push-ups, rows, planks" />
            </ExpandableSection>

            <ExpandableSection title="Flexibility & Balance">
              <BulletItem text="Yoga or stretching 2-3 times per week" />
              <BulletItem text="Focus on hip openers, hamstrings, and shoulder mobility" />
              <BulletItem text="Consider Surya Namaskar (Sun Salutation) as warm-up" />
            </ExpandableSection>
          </>
        )}

        {/* Supplements Tab */}
        {activeTab === "supplements" && (
          <>
            <ExpandableSection title="Evidence-Based Considerations" defaultExpanded>
              <BulletItem text="Omega-3 fatty acids: Consider if triglycerides >150 mg/dL (discuss dose with doctor)" />
              <BulletItem text="Vitamin D: Test levels first; supplement if deficient (<30 ng/mL)" />
              <BulletItem text="Fiber supplement: Consider psyllium husk (Isabgol) 5-10g/day if dietary fiber is insufficient" />
            </ExpandableSection>

            <ExpandableSection title="Not Recommended">
              <BulletItem text="Antioxidant megadoses (Vitamins E, C, beta-carotene) - no proven CV benefit" />
              <BulletItem text="Garlic supplements - insufficient evidence for CV risk reduction" />
              <BulletItem text="CoQ10 - not recommended for primary prevention" />
            </ExpandableSection>

            <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2">
              <Text className="text-xs text-amber-800">
                Always discuss supplements with your healthcare provider,
                especially if taking medications. Some supplements can interact
                with statins and blood pressure medications.
              </Text>
            </View>
          </>
        )}

        {/* Monitoring Tab */}
        {activeTab === "monitoring" && (
          <>
            <ExpandableSection title="Weekly Checks" defaultExpanded>
              <BulletItem text="Weigh yourself once weekly, same time and conditions" />
              <BulletItem text="Track blood pressure at home 2-3 times per week" />
              <BulletItem text="Log exercise sessions (duration, type, intensity)" />
            </ExpandableSection>

            <ExpandableSection title="Monthly Reviews">
              <BulletItem text="Review weight and BP trends in the Trends tab" />
              <BulletItem text="Assess adherence to dietary goals" />
              <BulletItem text="Adjust exercise intensity if needed" />
            </ExpandableSection>

            <ExpandableSection title="Quarterly Lab Work">
              <BulletItem text="Lipid panel (if actively working on LDL reduction)" />
              <BulletItem text="Fasting glucose / HbA1c (if prediabetic)" />
              <BulletItem text="Upload results to track progress" />
            </ExpandableSection>
          </>
        )}

        {/* Targets Tab */}
        {activeTab === "targets" && (
          <>
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
              <Text className="text-sm font-semibold text-text-primary mb-3">
                Your Personalized Targets
              </Text>
              {[
                {
                  label: "LDL Cholesterol",
                  current: "142",
                  target: "<100",
                  unit: "mg/dL",
                },
                {
                  label: "HDL Cholesterol",
                  current: "48",
                  target: ">40",
                  unit: "mg/dL",
                },
                {
                  label: "Triglycerides",
                  current: "138",
                  target: "<150",
                  unit: "mg/dL",
                },
                {
                  label: "Systolic BP",
                  current: "126",
                  target: "<130",
                  unit: "mmHg",
                },
                {
                  label: "BMI",
                  current: "25.8",
                  target: "<25",
                  unit: "kg/m2",
                },
                {
                  label: "HbA1c",
                  current: "5.8",
                  target: "<5.7",
                  unit: "%",
                },
              ].map((item) => {
                const currentNum = parseFloat(item.current);
                const targetNum = parseFloat(item.target.replace(/[<>]/g, ""));
                const isOnTarget = item.target.startsWith("<")
                  ? currentNum < targetNum
                  : currentNum > targetNum;

                return (
                  <View
                    key={item.label}
                    className="flex-row items-center justify-between py-3 border-b border-gray-50"
                  >
                    <Text className="text-sm text-text-primary flex-1">
                      {item.label}
                    </Text>
                    <Text className="text-sm font-medium text-text-primary w-16 text-right">
                      {item.current}
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color="#9CA3AF"
                      style={{ marginHorizontal: 8 }}
                    />
                    <Text className="text-sm font-medium text-primary-600 w-16 text-right">
                      {item.target}
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
          </>
        )}

        {/* Regenerate Button */}
        {hasGenerated && (
          <Pressable
            onPress={handleGenerate}
            disabled={isGenerating}
            className="flex-row items-center justify-center h-10 border border-gray-200 rounded-xl mt-2 active:bg-gray-50"
          >
            <Ionicons name="refresh" size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-text-secondary font-medium">
              Regenerate Plan
            </Text>
          </Pressable>
        )}

        <DisclaimerBanner disclaimerKey="lifestyle" />
      </ScrollView>
    </SafeAreaView>
  );
}
