// ── react-native-reanimated type declarations ──────────────────────
// Minimal type declarations for react-native-reanimated when the package
// types are not installed in this workspace.

declare module 'react-native-reanimated' {
  import type { ComponentType } from 'react';

  /** Shared value container. */
  interface SharedValue<T> {
    value: T;
  }

  /** Easing functions. */
  interface EasingModule {
    linear: (t: number) => number;
    ease: (t: number) => number;
    quad: (t: number) => number;
    cubic: (t: number) => number;
    poly: (n: number) => (t: number) => number;
    sin: (t: number) => number;
    circle: (t: number) => number;
    exp: (t: number) => number;
    elastic: (bounciness?: number) => (t: number) => number;
    back: (s?: number) => (t: number) => number;
    bounce: (t: number) => number;
    bezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => number;
    in: (easing: (t: number) => number) => (t: number) => number;
    out: (easing: (t: number) => number) => (t: number) => number;
    inOut: (easing: (t: number) => number) => (t: number) => number;
  }

  interface WithTimingConfig {
    duration?: number;
    easing?: (t: number) => number;
  }

  /** Hooks. */
  function useSharedValue<T>(initialValue: T): SharedValue<T>;
  function useAnimatedProps<T extends Record<string, unknown>>(
    updater: () => T,
    dependencies?: ReadonlyArray<unknown>,
  ): T;
  function useAnimatedStyle<T extends Record<string, unknown>>(
    updater: () => T,
    dependencies?: ReadonlyArray<unknown>,
  ): T;

  /** Animation functions. */
  function withTiming<T>(
    toValue: T,
    config?: WithTimingConfig,
  ): T;
  function withSpring<T>(
    toValue: T,
    config?: Record<string, unknown>,
  ): T;

  /** Easing namespace. */
  const Easing: EasingModule;

  /** Animated component factory. */
  interface AnimatedNamespace {
    View: ComponentType<Record<string, unknown>>;
    Text: ComponentType<Record<string, unknown>>;
    Image: ComponentType<Record<string, unknown>>;
    ScrollView: ComponentType<Record<string, unknown>>;
    createAnimatedComponent: <P extends Record<string, unknown>>(
      component: ComponentType<P>,
    ) => ComponentType<P & { animatedProps?: Partial<P> }>;
  }

  const Animated: AnimatedNamespace;
  export default Animated;
  export {
    useSharedValue,
    useAnimatedProps,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
    type SharedValue,
  };
}
