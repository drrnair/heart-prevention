import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { useSupplementReference } from "@/hooks/useSupplementReference";
import type { SupplementReference } from "@/hooks/useSupplementReference";

const TIER_CONFIG: Record<
  number,
  { readonly label: string; readonly bg: string; readonly text: string; readonly color: string }
> = {
  1: { label: "Tier 1", bg: "bg-green-100", text: "text-green-800", color: "#22C55E" },
  2: { label: "Tier 2", bg: "bg-yellow-100", text: "text-yellow-800", color: "#EAB308" },
  3: { label: "Tier 3", bg: "bg-orange-100", text: "text-orange-800", color: "#F97316" },
};

function ReferenceCard({ item }: { readonly item: SupplementReference }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tier = TIER_CONFIG[item.evidence_tier] ?? TIER_CONFIG[3];

  return (
    <Pressable
      onPress={() => setIsExpanded((prev) => !prev)}
      className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, evidence ${tier.label}`}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-gray-900 flex-1 mr-2">
          {item.name}
        </Text>
        <View className={`px-2 py-1 rounded-full ${tier.bg}`}>
          <Text className={`text-xs font-medium ${tier.text}`}>
            {tier.label}
          </Text>
        </View>
      </View>
      <Text className="text-sm text-gray-500 mt-1">{item.key_benefit}</Text>

      {isExpanded && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <DetailRow label="Mechanism" value={item.mechanism} />
          <DetailRow label="Evidence" value={item.evidence_summary} />
          <DetailRow label="Recommended Dose" value={item.recommended_dose} />
          {item.interactions.length > 0 && (
            <DetailRow
              label="Interactions"
              value={item.interactions.join(", ")}
            />
          )}
          {item.contraindications.length > 0 && (
            <DetailRow
              label="Contraindications"
              value={item.contraindications.join(", ")}
            />
          )}
          {item.quality_markers.length > 0 && (
            <DetailRow
              label="Quality Markers"
              value={item.quality_markers.join(", ")}
            />
          )}
        </View>
      )}
    </Pressable>
  );
}

function DetailRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <View className="mb-2">
      <Text className="text-xs font-medium text-gray-500">{label}</Text>
      <Text className="text-sm text-gray-900 mt-0.5">{value}</Text>
    </View>
  );
}

export default function SupplementReferenceScreen() {
  const router = useRouter();
  const { references, isLoading, error } = useSupplementReference();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface-secondary">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="mr-3" accessibilityRole="button" accessibilityLabel="Go back" style={{ minHeight: 44, minWidth: 44 }}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-xl font-bold text-text-primary">
            Evidence-Based Supplements
          </Text>
        </View>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <Text className="text-sm text-red-700">{error}</Text>
          </View>
        )}

        <View className="bg-white border border-gray-200 rounded-xl p-3 mb-4">
          <Text className="text-xs font-semibold text-gray-700 mb-2">
            Evidence Tier Legend
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-full bg-green-500" />
              <Text className="text-xs text-gray-600">Strong</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-full bg-yellow-500" />
              <Text className="text-xs text-gray-600">Moderate</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-full bg-orange-500" />
              <Text className="text-xs text-gray-600">Emerging</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={references}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReferenceCard item={item} />}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-base text-gray-400">
                No reference data available
              </Text>
            </View>
          }
          ListFooterComponent={<DisclaimerBanner disclaimerKey="supplements" />}
          contentContainerClassName="pb-8"
        />
      </View>
    </SafeAreaView>
  );
}
