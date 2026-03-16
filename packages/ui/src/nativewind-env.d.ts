// ── NativeWind className augmentation ────────────────────────────────
// NativeWind adds a `className` prop to React Native core components.
// Since the nativewind package types may not be available in this package,
// we declare the augmentation manually.

import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
}
