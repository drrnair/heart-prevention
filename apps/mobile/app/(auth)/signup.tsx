import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";

export default function SignupScreen() {
  const { signUpWithEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (!agreedToTerms || !agreedToPrivacy) {
      Alert.alert(
        "Error",
        "Please agree to the Terms of Service and Privacy Policy.",
      );
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUpWithEmail(email.trim(), password);
    setIsSubmitting(false);

    if (error) {
      Alert.alert("Sign Up Failed", error);
    } else {
      Alert.alert(
        "Check Your Email",
        "We've sent a confirmation link to your email address. Please verify to continue.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerClassName="flex-grow px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-3">
            <Ionicons name="heart" size={32} color="#DC2626" />
          </View>
          <Text className="text-2xl font-bold text-text-primary">
            Create Account
          </Text>
          <Text className="text-sm text-text-secondary mt-1 text-center">
            Start your cardiac wellness journey
          </Text>
        </View>

        {/* Email */}
        <View className="mb-4">
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

        {/* Password */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-text-primary mb-1.5">
            Password
          </Text>
          <View className="flex-row items-center bg-surface-secondary border border-gray-200 rounded-xl px-4 h-12">
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-text-primary"
              placeholder="At least 8 characters"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9CA3AF"
              />
            </Pressable>
          </View>
        </View>

        {/* Confirm Password */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-text-primary mb-1.5">
            Confirm Password
          </Text>
          <View className="flex-row items-center bg-surface-secondary border border-gray-200 rounded-xl px-4 h-12">
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-text-primary"
              placeholder="Re-enter your password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Checkboxes */}
        <Pressable
          onPress={() => setAgreedToTerms((prev) => !prev)}
          className="flex-row items-start mb-3"
        >
          <Ionicons
            name={agreedToTerms ? "checkbox" : "square-outline"}
            size={22}
            color={agreedToTerms ? "#DC2626" : "#9CA3AF"}
          />
          <Text className="flex-1 ml-3 text-sm text-text-secondary">
            I agree to the{" "}
            <Text className="text-primary-600 font-medium">
              Terms of Service
            </Text>
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setAgreedToPrivacy((prev) => !prev)}
          className="flex-row items-start mb-6"
        >
          <Ionicons
            name={agreedToPrivacy ? "checkbox" : "square-outline"}
            size={22}
            color={agreedToPrivacy ? "#DC2626" : "#9CA3AF"}
          />
          <Text className="flex-1 ml-3 text-sm text-text-secondary">
            I agree to the{" "}
            <Text className="text-primary-600 font-medium">Privacy Policy</Text>
          </Text>
        </Pressable>

        {/* Wellness Disclaimer */}
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-start gap-2">
            <Ionicons
              name="information-circle"
              size={20}
              color="#D97706"
            />
            <Text className="flex-1 text-xs text-amber-800 leading-4">
              HeartPrevention is a wellness and educational app. It is{" "}
              <Text className="font-bold">not a medical device</Text> and does
              not provide medical diagnoses or treatment recommendations. Always
              consult your healthcare provider for medical decisions.
            </Text>
          </View>
        </View>

        {/* Sign Up Button */}
        <Pressable
          onPress={handleSignup}
          disabled={isSubmitting}
          className="bg-primary-600 h-12 rounded-xl items-center justify-center mb-6 active:bg-primary-700"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-base font-semibold">
              Create Account
            </Text>
          )}
        </Pressable>

        {/* Login Link */}
        <View className="flex-row justify-center">
          <Text className="text-sm text-text-secondary">
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="text-sm text-primary-600 font-semibold">
                Sign In
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
