import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { DISCLAIMERS, type DisclaimerKey } from '@heart/shared';

// ── Props ────────────────────────────────────────────────────────────

export interface DisclaimerBannerProps {
  /** Which disclaimer to display. */
  readonly type: DisclaimerKey;
  /** When true the banner body can be collapsed (tap header to toggle). */
  readonly collapsible?: boolean;
}

// ── Icons (inline SVG-free for broad RN compat) ─────────────────────

const WARNING_ICON = '\u26A0\uFE0F'; // warning sign emoji as fallback icon
const CHEVRON_DOWN = '\u25BC';
const CHEVRON_UP = '\u25B2';

// ── Component ────────────────────────────────────────────────────────

export function DisclaimerBanner({
  type,
  collapsible = false,
}: DisclaimerBannerProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(true);
  const text = DISCLAIMERS[type];

  const toggle = () => {
    if (collapsible) {
      setExpanded((prev) => !prev);
    }
  };

  return (
    <View className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 my-2">
      <Pressable
        onPress={toggle}
        className="flex-row items-center justify-between"
        accessibilityRole="button"
        accessibilityLabel={collapsible ? 'Toggle disclaimer' : 'Disclaimer'}
        accessibilityState={{ expanded }}
      >
        <View className="flex-row items-center flex-1 mr-2">
          <Text className="text-base mr-2">{WARNING_ICON}</Text>
          <Text className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
            Important Notice
          </Text>
        </View>

        {collapsible && (
          <Text className="text-xs text-amber-600">
            {expanded ? CHEVRON_UP : CHEVRON_DOWN}
          </Text>
        )}
      </Pressable>

      {expanded && (
        <Text className="text-sm text-amber-900 leading-5 mt-2">
          {text}
        </Text>
      )}
    </View>
  );
}
