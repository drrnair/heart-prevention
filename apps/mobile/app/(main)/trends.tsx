import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryScatter,
  VictoryTheme,
  VictoryTooltip,
} from "victory-native";

const screenWidth = Dimensions.get("window").width;

type ChartCategory = "risk" | "lipids" | "vitals";

// Mock data
const RISK_DATA = [
  { x: new Date("2025-10-01"), y: 16.2, level: "L1" },
  { x: new Date("2025-12-15"), y: 13.8, level: "L2" },
  { x: new Date("2026-01-20"), y: 11.2, level: "L2" },
  { x: new Date("2026-03-01"), y: 12.4, level: "L1" },
];

const LDL_DATA = [
  { x: new Date("2025-12-15"), y: 158 },
  { x: new Date("2026-01-20"), y: 142 },
  { x: new Date("2026-03-01"), y: 135 },
];

const HDL_DATA = [
  { x: new Date("2025-12-15"), y: 42 },
  { x: new Date("2026-01-20"), y: 45 },
  { x: new Date("2026-03-01"), y: 48 },
];

const TG_DATA = [
  { x: new Date("2025-12-15"), y: 165 },
  { x: new Date("2026-01-20"), y: 148 },
  { x: new Date("2026-03-01"), y: 138 },
];

const SYSTOLIC_DATA = [
  { x: new Date("2025-10-01"), y: 138 },
  { x: new Date("2025-12-15"), y: 132 },
  { x: new Date("2026-01-20"), y: 128 },
  { x: new Date("2026-03-01"), y: 126 },
];

const WEIGHT_DATA = [
  { x: new Date("2025-10-01"), y: 82 },
  { x: new Date("2025-12-15"), y: 80.5 },
  { x: new Date("2026-01-20"), y: 79.2 },
  { x: new Date("2026-03-01"), y: 78.5 },
];

const LEVEL_COLORS: Record<string, string> = {
  L1: "#93C5FD",
  L2: "#60A5FA",
  L3: "#3B82F6",
  L4: "#1D4ED8",
};

function ChartCard({
  title,
  children,
  subtitle,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
  readonly subtitle?: string;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
      <Text className="text-sm font-semibold text-text-primary">{title}</Text>
      {subtitle && (
        <Text className="text-xs text-text-tertiary mt-0.5">{subtitle}</Text>
      )}
      <View className="mt-2">{children}</View>
    </View>
  );
}

export default function TrendsScreen() {
  const [category, setCategory] = useState<ChartCategory>("risk");

  const chartWidth = screenWidth - 56;

  const categories: readonly { readonly key: ChartCategory; readonly label: string }[] = [
    { key: "risk", label: "Risk Score" },
    { key: "lipids", label: "Lab Values" },
    { key: "vitals", label: "Vitals" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 pb-8"
      >
        {/* Header */}
        <Text className="text-2xl font-bold text-text-primary mb-4">
          Trends
        </Text>

        {/* Category Tabs */}
        <View className="flex-row bg-surface-tertiary rounded-xl p-1 mb-6">
          {categories.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() => setCategory(cat.key)}
              className={`flex-1 py-2.5 rounded-lg items-center ${
                category === cat.key ? "bg-white shadow-sm" : ""
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  category === cat.key
                    ? "text-primary-600"
                    : "text-text-secondary"
                }`}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Risk Score Chart */}
        {category === "risk" && (
          <ChartCard
            title="10-Year Risk Score"
            subtitle="Data level annotated at each point"
          >
            <VictoryChart
              width={chartWidth}
              height={220}
              theme={VictoryTheme.material}
              scale={{ x: "time" }}
              padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
            >
              <VictoryAxis
                dependentAxis
                tickFormat={(t: number) => `${t}%`}
                style={{
                  tickLabels: { fontSize: 10, fill: "#6B7280" },
                  grid: { stroke: "#F3F4F6" },
                }}
              />
              <VictoryAxis
                tickFormat={(t: Date) =>
                  t.toLocaleDateString("en-US", { month: "short" })
                }
                style={{
                  tickLabels: { fontSize: 10, fill: "#6B7280" },
                }}
              />
              <VictoryLine
                data={RISK_DATA}
                style={{
                  data: { stroke: "#DC2626", strokeWidth: 2 },
                }}
              />
              <VictoryScatter
                data={RISK_DATA}
                size={6}
                style={{
                  data: {
                    fill: ({ datum }: { datum: { level: string } }) =>
                      LEVEL_COLORS[datum.level] ?? "#93C5FD",
                    stroke: "#FFFFFF",
                    strokeWidth: 2,
                  },
                }}
                labels={({ datum }: { datum: { level: string } }) =>
                  datum.level
                }
                labelComponent={
                  <VictoryTooltip
                    renderInPortal={false}
                    flyoutStyle={{
                      fill: "white",
                      stroke: "#E5E7EB",
                    }}
                    style={{ fontSize: 10 }}
                  />
                }
              />
            </VictoryChart>

            {/* Level Legend */}
            <View className="flex-row justify-center gap-4 mt-2">
              {["L1", "L2", "L3", "L4"].map((level) => (
                <View key={level} className="flex-row items-center gap-1">
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: LEVEL_COLORS[level] }}
                  />
                  <Text className="text-2xs text-text-tertiary">{level}</Text>
                </View>
              ))}
            </View>
          </ChartCard>
        )}

        {/* Lipids Charts */}
        {category === "lipids" && (
          <>
            <ChartCard title="LDL Cholesterol" subtitle="mg/dL - Target: <100">
              <VictoryChart
                width={chartWidth}
                height={180}
                theme={VictoryTheme.material}
                scale={{ x: "time" }}
                padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
              >
                <VictoryAxis
                  dependentAxis
                  style={{
                    tickLabels: { fontSize: 10, fill: "#6B7280" },
                    grid: { stroke: "#F3F4F6" },
                  }}
                />
                <VictoryAxis
                  tickFormat={(t: Date) =>
                    t.toLocaleDateString("en-US", { month: "short" })
                  }
                  style={{
                    tickLabels: { fontSize: 10, fill: "#6B7280" },
                  }}
                />
                <VictoryLine
                  data={LDL_DATA}
                  style={{
                    data: { stroke: "#EF4444", strokeWidth: 2 },
                  }}
                />
                <VictoryScatter
                  data={LDL_DATA}
                  size={4}
                  style={{ data: { fill: "#EF4444" } }}
                />
              </VictoryChart>
            </ChartCard>

            <ChartCard title="HDL Cholesterol" subtitle="mg/dL - Target: >40">
              <VictoryChart
                width={chartWidth}
                height={180}
                theme={VictoryTheme.material}
                scale={{ x: "time" }}
                padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
              >
                <VictoryAxis
                  dependentAxis
                  style={{
                    tickLabels: { fontSize: 10, fill: "#6B7280" },
                    grid: { stroke: "#F3F4F6" },
                  }}
                />
                <VictoryAxis
                  tickFormat={(t: Date) =>
                    t.toLocaleDateString("en-US", { month: "short" })
                  }
                  style={{
                    tickLabels: { fontSize: 10, fill: "#6B7280" },
                  }}
                />
                <VictoryLine
                  data={HDL_DATA}
                  style={{
                    data: { stroke: "#22C55E", strokeWidth: 2 },
                  }}
                />
                <VictoryScatter
                  data={HDL_DATA}
                  size={4}
                  style={{ data: { fill: "#22C55E" } }}
                />
              </VictoryChart>
            </ChartCard>

            <ChartCard title="Triglycerides" subtitle="mg/dL - Target: <150">
              <VictoryChart
                width={chartWidth}
                height={180}
                theme={VictoryTheme.material}
                scale={{ x: "time" }}
                padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
              >
                <VictoryAxis
                  dependentAxis
                  style={{
                    tickLabels: { fontSize: 10, fill: "#6B7280" },
                    grid: { stroke: "#F3F4F6" },
                  }}
                />
                <VictoryAxis
                  tickFormat={(t: Date) =>
                    t.toLocaleDateString("en-US", { month: "short" })
                  }
                  style={{
                    tickLabels: { fontSize: 10, fill: "#6B7280" },
                  }}
                />
                <VictoryLine
                  data={TG_DATA}
                  style={{
                    data: { stroke: "#F97316", strokeWidth: 2 },
                  }}
                />
                <VictoryScatter
                  data={TG_DATA}
                  size={4}
                  style={{ data: { fill: "#F97316" } }}
                />
              </VictoryChart>
            </ChartCard>
          </>
        )}

        {/* Vitals Charts */}
        {category === "vitals" && (
          <>
            <ChartCard
              title="Systolic Blood Pressure"
              subtitle="mmHg - Target: <130"
            >
              <VictoryChart
                width={chartWidth}
                height={180}
                theme={VictoryTheme.material}
                scale={{ x: "time" }}
                padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
              >
                <VictoryAxis
                  dependentAxis
                  style={{
                    tickLabels: { fontSize: 10, fill: "#6B7280" },
                    grid: { stroke: "#F3F4F6" },
                  }}
                />
                <VictoryAxis
                  tickFormat={(t: Date) =>
                    t.toLocaleDateString("en-US", { month: "short" })
                  }
                  style={{
                    tickLabels: { fontSize: 10, fill: "#6B7280" },
                  }}
                />
                <VictoryLine
                  data={SYSTOLIC_DATA}
                  style={{
                    data: { stroke: "#8B5CF6", strokeWidth: 2 },
                  }}
                />
                <VictoryScatter
                  data={SYSTOLIC_DATA}
                  size={4}
                  style={{ data: { fill: "#8B5CF6" } }}
                />
              </VictoryChart>
            </ChartCard>

            <ChartCard title="Weight" subtitle="kg">
              <VictoryChart
                width={chartWidth}
                height={180}
                theme={VictoryTheme.material}
                scale={{ x: "time" }}
                padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
              >
                <VictoryAxis
                  dependentAxis
                  style={{
                    tickLabels: { fontSize: 10, fill: "#6B7280" },
                    grid: { stroke: "#F3F4F6" },
                  }}
                />
                <VictoryAxis
                  tickFormat={(t: Date) =>
                    t.toLocaleDateString("en-US", { month: "short" })
                  }
                  style={{
                    tickLabels: { fontSize: 10, fill: "#6B7280" },
                  }}
                />
                <VictoryLine
                  data={WEIGHT_DATA}
                  style={{
                    data: { stroke: "#0EA5E9", strokeWidth: 2 },
                  }}
                />
                <VictoryScatter
                  data={WEIGHT_DATA}
                  size={4}
                  style={{ data: { fill: "#0EA5E9" } }}
                />
              </VictoryChart>
            </ChartCard>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
