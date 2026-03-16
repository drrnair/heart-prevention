import React, { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SupplementCardProps {
  readonly name: string;
  readonly dosage: string;
  readonly frequency: string;
  readonly status: "active" | "paused" | "stopped";
  readonly isMedication: boolean;
  readonly onStatusChange: (status: string) => void;
  readonly onDelete: () => void;
}

const STATUS_STYLES: Record<string, { readonly bg: string; readonly text: string }> = {
  active: { bg: "bg-green-100", text: "text-green-800" },
  paused: { bg: "bg-yellow-100", text: "text-yellow-800" },
  stopped: { bg: "bg-red-100", text: "text-red-800" },
};

export function SupplementCard({
  name,
  dosage,
  frequency,
  status,
  isMedication,
  onStatusChange,
  onDelete,
}: SupplementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.active;

  const handleDelete = () => {
    Alert.alert(
      "Delete Supplement",
      `Are you sure you want to remove ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ],
    );
  };

  return (
    <Pressable
      onPress={() => setIsExpanded((prev) => !prev)}
      className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
      accessibilityLabel={`${name}, ${dosage}, ${frequency}, status: ${status}, ${isMedication ? 'medication' : 'supplement'}`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 gap-2">
          <Text className="text-lg">{isMedication ? "\u{1F48A}" : "\u{1F33F}"}</Text>
          <Text className="text-base font-semibold text-gray-900 flex-1">
            {name}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-full ${statusStyle.bg}`}>
          <Text className={`text-xs font-medium ${statusStyle.text}`}>
            {status}
          </Text>
        </View>
      </View>

      {isExpanded && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">Dosage</Text>
            <Text className="text-sm text-gray-900">{dosage}</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-gray-500">Frequency</Text>
            <Text className="text-sm text-gray-900">{frequency}</Text>
          </View>

          <View className="flex-row gap-2">
            {status !== "active" && (
              <Pressable
                onPress={() => onStatusChange("active")}
                className="flex-1 bg-green-50 rounded-lg py-2 items-center"
              >
                <Text className="text-xs font-medium text-green-700">
                  Activate
                </Text>
              </Pressable>
            )}
            {status !== "paused" && status !== "stopped" && (
              <Pressable
                onPress={() => onStatusChange("paused")}
                className="flex-1 bg-yellow-50 rounded-lg py-2 items-center"
              >
                <Text className="text-xs font-medium text-yellow-700">
                  Pause
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleDelete}
              className="bg-red-50 rounded-lg py-2 px-3 items-center"
              accessibilityRole="button"
              accessibilityLabel={`Delete ${name}`}
              style={{ minHeight: 44, minWidth: 44 }}
            >
              <Ionicons name="trash-outline" size={16} color="#DC2626" />
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
}
