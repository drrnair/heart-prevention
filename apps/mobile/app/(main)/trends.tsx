import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from "react-native";
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryScatter,
  VictoryTheme,
  VictoryTooltip,
} from "victory-native";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useTrends } from "@/hooks/useTrends";
import { useUnits } from "@/hooks/useUnits";

const screenWidth = Dimensions.get("window").width;

type ChartCategory = "risk" | "lipids" | "vitals";

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
    <View className="bg-white rounded-2xl p-4 shadow-sm mb-4" accessibilityLabel={`${title} trend chart${subtitle ? `, ${subtitle}` : ''}`}>
      <Text className="text-sm font-semibold text-text-primary">{title}</Text>
      {subtitle && (
        <Text className="text-xs text-text-tertiary mt-0.5">{subtitle}</Text>
      )}
      <View className="mt-2">{children}</View>
    </View>
  );
}

function EmptyChart({ message }: { readonly message: string }) {
  return (
    <View className="bg-white rounded-2xl p-6 shadow-sm mb-4 items-center">
      <Text className="text-sm text-text-secondary text-center">
        {message}
      </Text>
    </View>
  );
}

export default function TrendsScreen() {
  const [category, setCategory] = useState<ChartCategory>("risk");
  const { riskData, ldlData, hdlData, tgData, systolicData, weightData, isLoading, error, refetch } =
    useTrends();
  const { cholUnit, weightUnit, formatChol, formatTG } = useUnits();
  const isMmol = cholUnit === "mmol/L";

  const chartWidth = screenWidth - 56;

  const categories: readonly { readonly key: ChartCategory; readonly label: string }[] = [
    { key: "risk", label: "Risk Score" },
    { key: "lipids", label: "Lab Values" },
    { key: "vitals", label: "Vitals" },
  ];

  if (isLoading && riskData.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-surface-secondary">
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-surface-secondary">
        <ErrorBanner message={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const emptyMessage = "No data yet. Upload results to see trends.";

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <Text className="text-2xl font-bold text-text-primary mb-4">
          Trends
        </Text>

        <View className="flex-row bg-surface-tertiary rounded-xl p-1 mb-6">
          {categories.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() => setCategory(cat.key)}
              className={`flex-1 py-2.5 rounded-lg items-center ${
                category === cat.key ? "bg-white shadow-sm" : ""
              }`}
              accessibilityRole="tab"
              accessibilityState={{ selected: category === cat.key }}
              accessibilityLabel={cat.label}
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

        {category === "risk" && (
          riskData.length === 0 ? (
            <EmptyChart message={emptyMessage} />
          ) : (
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
                  data={riskData}
                  style={{
                    data: { stroke: "#DC2626", strokeWidth: 2 },
                  }}
                />
                <VictoryScatter
                  data={riskData}
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
          )
        )}

        {category === "lipids" && (
          ldlData.length === 0 && hdlData.length === 0 && tgData.length === 0 ? (
            <EmptyChart message={emptyMessage} />
          ) : (
            <>
              {ldlData.length > 0 && (
                <ChartCard title="LDL Cholesterol" subtitle={`${cholUnit} - Target: ${isMmol ? "<2.59" : "<100"}`}>
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
                      data={ldlData}
                      style={{
                        data: { stroke: "#EF4444", strokeWidth: 2 },
                      }}
                    />
                    <VictoryScatter
                      data={ldlData}
                      size={4}
                      style={{ data: { fill: "#EF4444" } }}
                    />
                  </VictoryChart>
                </ChartCard>
              )}

              {hdlData.length > 0 && (
                <ChartCard title="HDL Cholesterol" subtitle={`${cholUnit} - Target: ${isMmol ? ">1.03" : ">40"}`}>
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
                      data={hdlData}
                      style={{
                        data: { stroke: "#22C55E", strokeWidth: 2 },
                      }}
                    />
                    <VictoryScatter
                      data={hdlData}
                      size={4}
                      style={{ data: { fill: "#22C55E" } }}
                    />
                  </VictoryChart>
                </ChartCard>
              )}

              {tgData.length > 0 && (
                <ChartCard title="Triglycerides" subtitle={`${cholUnit} - Target: ${isMmol ? "<1.69" : "<150"}`}>
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
                      data={tgData}
                      style={{
                        data: { stroke: "#F97316", strokeWidth: 2 },
                      }}
                    />
                    <VictoryScatter
                      data={tgData}
                      size={4}
                      style={{ data: { fill: "#F97316" } }}
                    />
                  </VictoryChart>
                </ChartCard>
              )}
            </>
          )
        )}

        {category === "vitals" && (
          systolicData.length === 0 && weightData.length === 0 ? (
            <EmptyChart message={emptyMessage} />
          ) : (
            <>
              {systolicData.length > 0 && (
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
                      data={systolicData}
                      style={{
                        data: { stroke: "#8B5CF6", strokeWidth: 2 },
                      }}
                    />
                    <VictoryScatter
                      data={systolicData}
                      size={4}
                      style={{ data: { fill: "#8B5CF6" } }}
                    />
                  </VictoryChart>
                </ChartCard>
              )}

              {weightData.length > 0 && (
                <ChartCard title="Weight" subtitle={weightUnit}>
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
                      data={weightData}
                      style={{
                        data: { stroke: "#0EA5E9", strokeWidth: 2 },
                      }}
                    />
                    <VictoryScatter
                      data={weightData}
                      size={4}
                      style={{ data: { fill: "#0EA5E9" } }}
                    />
                  </VictoryChart>
                </ChartCard>
              )}
            </>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
