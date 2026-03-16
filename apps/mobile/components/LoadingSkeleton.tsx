import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

interface SkeletonCardProps {
  readonly width: string;
  readonly height: number;
}

function SkeletonCard({ width, height }: SkeletonCardProps) {
  return (
    <View
      className={`${width} rounded-2xl bg-gray-200 mb-3`}
      style={{ height }}
    />
  );
}

export function LoadingSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }} className="px-4 py-4" accessibilityLabel="Loading content" accessibilityRole="progressbar">
      <SkeletonCard width="w-full" height={160} />
      <SkeletonCard width="w-full" height={100} />
      <SkeletonCard width="w-full" height={80} />
    </Animated.View>
  );
}
