// ── victory-native type declarations ────────────────────────────────
// Type declarations for Victory charting components used by this package.
// victory-native v41+ uses a different API (CartesianChart, Line, etc.)
// but these declarations cover the Victory v6-style API that our
// components currently reference. At runtime, the consuming app must
// ensure the correct module resolution (e.g. via a compatibility layer
// or by using the `victory` package alongside `victory-native`).

declare module 'victory-native' {
  import type { ComponentType, ReactNode } from 'react';

  // ── Common types ────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type VictoryStyleValue = string | number | undefined | ((args: any) => any);

  interface VictoryStyleObject {
    readonly [key: string]: VictoryStyleValue;
  }

  interface VictoryStyleInterface {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly data?: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly labels?: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly parent?: Record<string, any>;
  }

  interface VictoryPadding {
    readonly top?: number;
    readonly bottom?: number;
    readonly left?: number;
    readonly right?: number;
  }

  interface VictoryDomainPadding {
    readonly x?: number | [number, number];
    readonly y?: number | [number, number];
  }

  interface VictoryThemeDefinition {
    readonly [key: string]: unknown;
  }

  // ── VictoryTheme ────────────────────────────────────────────────────

  interface VictoryThemeStatic {
    readonly material: VictoryThemeDefinition;
    readonly grayscale: VictoryThemeDefinition;
  }

  export const VictoryTheme: VictoryThemeStatic;

  // ── VictoryChart ────────────────────────────────────────────────────

  interface VictoryChartProps {
    readonly children?: ReactNode;
    readonly theme?: VictoryThemeDefinition;
    readonly width?: number;
    readonly height?: number;
    readonly padding?: number | VictoryPadding;
    readonly domainPadding?: number | VictoryDomainPadding;
    readonly domain?: { readonly x?: [number, number]; readonly y?: [number, number] };
  }

  export const VictoryChart: ComponentType<VictoryChartProps>;

  // ── VictoryLine ─────────────────────────────────────────────────────

  interface VictoryLineProps {
    readonly data?: ReadonlyArray<Record<string, unknown>>;
    readonly style?: VictoryStyleInterface;
    readonly interpolation?: string;
    readonly x?: string | ((datum: Record<string, unknown>) => number);
    readonly y?: string | ((datum: Record<string, unknown>) => number);
  }

  export const VictoryLine: ComponentType<VictoryLineProps>;

  // ── VictoryScatter ──────────────────────────────────────────────────

  interface VictoryScatterProps {
    readonly data?: ReadonlyArray<Record<string, unknown>>;
    readonly style?: VictoryStyleInterface;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly size?: number | ((args: any) => number);
    readonly symbol?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly labels?: (args: any) => string;
    readonly labelComponent?: ReactNode;
    readonly x?: string | ((datum: Record<string, unknown>) => number);
    readonly y?: string | ((datum: Record<string, unknown>) => number);
  }

  export const VictoryScatter: ComponentType<VictoryScatterProps>;

  // ── VictoryAxis ─────────────────────────────────────────────────────

  interface VictoryAxisProps {
    readonly dependentAxis?: boolean;
    readonly tickFormat?: ((tick: unknown, index: number, ticks: unknown[]) => string) | ReadonlyArray<string>;
    readonly tickValues?: ReadonlyArray<number | string>;
    readonly tickCount?: number;
    readonly style?: {
      readonly axis?: VictoryStyleObject;
      readonly axisLabel?: VictoryStyleObject;
      readonly grid?: VictoryStyleObject;
      readonly ticks?: VictoryStyleObject;
      readonly tickLabels?: VictoryStyleObject;
    };
    readonly label?: string;
  }

  export const VictoryAxis: ComponentType<VictoryAxisProps>;

  // ── VictoryArea ─────────────────────────────────────────────────────

  interface VictoryAreaProps {
    readonly data?: ReadonlyArray<Record<string, unknown>>;
    readonly style?: VictoryStyleInterface;
    readonly interpolation?: string;
    readonly x?: string | ((datum: Record<string, unknown>) => number);
    readonly y?: string | ((datum: Record<string, unknown>) => number);
    readonly y0?: string | ((datum: Record<string, unknown>) => number);
  }

  export const VictoryArea: ComponentType<VictoryAreaProps>;

  // ── VictoryLabel ────────────────────────────────────────────────────

  interface VictoryLabelProps {
    readonly dx?: number;
    readonly dy?: number;
    readonly angle?: number;
    readonly style?: VictoryStyleObject | ReadonlyArray<VictoryStyleObject>;
    readonly text?: string | ReadonlyArray<string>;
    readonly textAnchor?: 'start' | 'middle' | 'end';
    readonly verticalAnchor?: 'start' | 'middle' | 'end';
  }

  export const VictoryLabel: ComponentType<VictoryLabelProps>;
}
