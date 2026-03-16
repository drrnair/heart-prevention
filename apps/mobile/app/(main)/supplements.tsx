import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SupplementCard } from "@/components/SupplementCard";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { useSupplements } from "@/hooks/useSupplements";
import type { SupplementInput } from "@/hooks/useSupplements";

type FilterTab = "active" | "all";
type FrequencyOption = "Once daily" | "Twice daily" | "Weekly";

const FREQUENCY_OPTIONS: readonly FrequencyOption[] = [
  "Once daily",
  "Twice daily",
  "Weekly",
];

const INITIAL_FORM: SupplementInput = {
  name: "",
  dosage: "",
  frequency: "Once daily",
  isMedication: false,
  reason: "",
  startedAt: new Date().toISOString().slice(0, 10),
};

export default function SupplementsScreen() {
  const router = useRouter();
  const {
    supplements,
    isLoading,
    error,
    add,
    update,
    remove,
    pendingInferences,
    dismissInference,
  } = useSupplements();

  const [filter, setFilter] = useState<FilterTab>("active");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<SupplementInput>({ ...INITIAL_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredSupplements =
    filter === "active"
      ? supplements.filter((s) => s.status === "active")
      : supplements;

  const updateField = <K extends keyof SupplementInput>(
    key: K,
    value: SupplementInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.dosage.trim()) {
      Alert.alert("Required Fields", "Please enter a name and dosage.");
      return;
    }

    setIsSubmitting(true);
    const result = await add(form);
    setIsSubmitting(false);

    if (result.error) {
      Alert.alert("Error", result.error);
      return;
    }

    setShowModal(false);
    setForm({ ...INITIAL_FORM });

    if (pendingInferences.length > 0) {
      const inference = pendingInferences[0];
      Alert.alert(
        "Health Profile Update",
        `We noticed you take ${form.name}. Would you like to update your profile to reflect ${inference.condition}?`,
        [
          { text: "No thanks", onPress: () => dismissInference(inference.id) },
          { text: "Yes, update", style: "default" },
        ],
      );
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const result = await update(id, { status: status as "active" | "paused" | "stopped" });
    if (result.error) {
      Alert.alert("Error", result.error);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await remove(id);
    if (result.error) {
      Alert.alert("Error", result.error);
    }
  };

  if (isLoading && supplements.length === 0) {
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
          <Text className="text-xl font-bold text-text-primary flex-1">
            My Supplements & Medications
          </Text>
        </View>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <Text className="text-sm text-red-700">{error}</Text>
          </View>
        )}

        <View className="flex-row bg-gray-100 rounded-lg p-1 mb-4">
          <Pressable
            onPress={() => setFilter("active")}
            className={`flex-1 py-2 rounded-md items-center ${filter === "active" ? "bg-white shadow-sm" : ""}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === "active" }}
            accessibilityLabel="Active supplements"
          >
            <Text
              className={`text-sm font-medium ${filter === "active" ? "text-gray-900" : "text-gray-500"}`}
            >
              Active
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter("all")}
            className={`flex-1 py-2 rounded-md items-center ${filter === "all" ? "bg-white shadow-sm" : ""}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === "all" }}
            accessibilityLabel="All supplements"
          >
            <Text
              className={`text-sm font-medium ${filter === "all" ? "text-gray-900" : "text-gray-500"}`}
            >
              All
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={filteredSupplements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SupplementCard
              name={item.name}
              dosage={item.dosage}
              frequency={item.frequency}
              status={item.status}
              isMedication={false}
              onStatusChange={(status) => handleStatusChange(item.id, status)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-base text-gray-400">
                No supplements added yet
              </Text>
            </View>
          }
          ListFooterComponent={<DisclaimerBanner disclaimerKey="supplements" />}
          contentContainerClassName="pb-24"
        />
      </View>

      <Pressable
        onPress={() => setShowModal(true)}
        className="absolute bottom-8 right-6 w-14 h-14 bg-red-500 rounded-full items-center justify-center shadow-lg"
        accessibilityRole="button"
        accessibilityLabel="Add supplement"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10 shadow-lg">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-gray-900">
                Add Supplement
              </Text>
              <Pressable onPress={() => setShowModal(false)} accessibilityRole="button" accessibilityLabel="Close" style={{ minHeight: 44, minWidth: 44 }}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <Text className="text-sm font-medium text-gray-700 mb-1">
              Name *
            </Text>
            <TextInput
              value={form.name}
              onChangeText={(v) => updateField("name", v)}
              placeholder="e.g., Omega-3 Fish Oil"
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-4"
              accessibilityLabel="Supplement name"
            />

            <Text className="text-sm font-medium text-gray-700 mb-1">
              Dosage *
            </Text>
            <TextInput
              value={form.dosage}
              onChangeText={(v) => updateField("dosage", v)}
              placeholder="e.g., 500mg"
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-4"
              accessibilityLabel="Dosage"
            />

            <Text className="text-sm font-medium text-gray-700 mb-2">
              Frequency *
            </Text>
            <View className="flex-row bg-gray-100 rounded-lg p-1 mb-4">
              {FREQUENCY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => updateField("frequency", opt)}
                  className={`flex-1 py-2 rounded-md items-center ${form.frequency === opt ? "bg-white shadow-sm" : ""}`}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: form.frequency === opt }}
                  accessibilityLabel={opt}
                >
                  <Text
                    className={`text-xs font-medium ${form.frequency === opt ? "text-gray-900" : "text-gray-500"}`}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-medium text-gray-700">
                This is a prescribed medication
              </Text>
              <Switch
                value={form.isMedication}
                onValueChange={(v) => updateField("isMedication", v)}
                trackColor={{ true: "#DC2626" }}
                accessibilityLabel="This is a prescribed medication"
              />
            </View>

            <Text className="text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </Text>
            <TextInput
              value={form.reason}
              onChangeText={(v) => updateField("reason", v)}
              placeholder="e.g., Heart health"
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-4"
              accessibilityLabel="Reason for taking supplement"
            />

            <Text className="text-xs text-gray-400 mb-4">
              Started: {form.startedAt}
            </Text>

            <Pressable
              onPress={handleAdd}
              disabled={isSubmitting}
              className={`rounded-xl py-3 items-center ${isSubmitting ? "bg-red-300" : "bg-red-500"}`}
              accessibilityRole="button"
              accessibilityLabel="Add supplement"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-sm">
                  Add Supplement
                </Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
