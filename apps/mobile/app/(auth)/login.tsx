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
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
  const { signInWithEmail, signInWithGoogle, signInWithApple } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signInWithEmail(email.trim(), password);
    setIsSubmitting(false);

    if (error) {
      Alert.alert("Sign In Failed", error);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      Alert.alert("Google Sign In Failed", error);
    }
  };

  const handleAppleLogin = async () => {
    const { error } = await signInWithApple();
    if (error) {
      Alert.alert("Apple Sign In Failed", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo & Header */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="heart" size={40} color="#DC2626" />
          </View>
          <Text className="text-3xl font-bold text-text-primary">
            HeartPrevention
          </Text>
          <Text className="text-base text-text-secondary mt-2 text-center">
            Your cardiac wellness companion
          </Text>
        </View>

        {/* Email Input */}
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

        {/* Password Input */}
        <View className="mb-2">
          <Text className="text-sm font-medium text-text-primary mb-1.5">
            Password
          </Text>
          <View className="flex-row items-center bg-surface-secondary border border-gray-200 rounded-xl px-4 h-12">
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-text-primary"
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
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

        {/* Forgot Password */}
        <View className="items-end mb-6">
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable>
              <Text className="text-sm text-primary-600 font-medium">
                Forgot password?
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Sign In Button */}
        <Pressable
          onPress={handleEmailLogin}
          disabled={isSubmitting}
          className="bg-primary-600 h-12 rounded-xl items-center justify-center mb-6 active:bg-primary-700"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-base font-semibold">Sign In</Text>
          )}
        </Pressable>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="mx-4 text-sm text-text-tertiary">or</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* OAuth Buttons */}
        <Pressable
          onPress={handleGoogleLogin}
          className="flex-row items-center justify-center h-12 border border-gray-200 rounded-xl mb-3 active:bg-gray-50"
        >
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text className="ml-3 text-base font-medium text-text-primary">
            Continue with Google
          </Text>
        </Pressable>

        {Platform.OS === "ios" && (
          <Pressable
            onPress={handleAppleLogin}
            className="flex-row items-center justify-center h-12 bg-black rounded-xl mb-6 active:opacity-80"
          >
            <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
            <Text className="ml-3 text-base font-medium text-white">
              Continue with Apple
            </Text>
          </Pressable>
        )}

        {/* Sign Up Link */}
        <View className="flex-row justify-center mt-4">
          <Text className="text-sm text-text-secondary">
            Don't have an account?{" "}
          </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable>
              <Text className="text-sm text-primary-600 font-semibold">
                Sign Up
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
