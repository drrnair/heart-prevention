import React from "react";
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="entry-path" />
      <Stack.Screen name="demographics" />
      <Stack.Screen name="measurements" />
      <Stack.Screen name="medical-history" />
      <Stack.Screen name="preferences" />
    </Stack>
  );
}
