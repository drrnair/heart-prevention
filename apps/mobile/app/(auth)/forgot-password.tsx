import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await resetPassword(email.trim());
    setIsSubmitting(false);

    if (error) {
      Alert.alert("Error", error);
    } else {
      setIsSent(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 pt-16">
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center mb-8"
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
          <Text className="ml-2 text-base text-text-primary">Back</Text>
        </Pressable>

        {/* Header */}
        <View className="mb-8">
          <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="key-outline" size={32} color="#DC2626" />
          </View>
          <Text className="text-2xl font-bold text-text-primary">
            Reset Password
          </Text>
          <Text className="text-sm text-text-secondary mt-2">
            Enter the email address associated with your account. We'll send you
            a link to reset your password.
          </Text>
        </View>

        {isSent ? (
          <View className="bg-green-50 border border-green-200 rounded-xl p-6 items-center">
            <Ionicons
              name="checkmark-circle"
              size={48}
              color="#22C55E"
            />
            <Text className="text-lg font-semibold text-green-800 mt-3">
              Email Sent
            </Text>
            <Text className="text-sm text-green-700 text-center mt-2">
              Check your inbox for a password reset link. It may take a few
              minutes to arrive.
            </Text>
            <Pressable
              onPress={() => router.replace("/(auth)/login")}
              className="mt-6 bg-green-600 rounded-xl px-8 py-3 active:bg-green-700"
            >
              <Text className="text-white font-semibold">Back to Sign In</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-text-primary mb-1.5">
                Email
              </Text>
              <View className="flex-row items-center bg-surface-secondary border border-gray-200 rounded-xl px-4 h-12">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-text-primary"
                  placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleReset}
              disabled={isSubmitting}
              className="bg-primary-600 h-12 rounded-xl items-center justify-center active:bg-primary-700"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  Send Reset Link
                </Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
