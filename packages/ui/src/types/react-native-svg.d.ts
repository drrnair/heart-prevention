// ── react-native-svg type declarations ──────────────────────────────
// Minimal type declarations for react-native-svg when the package types
// are not installed in this workspace.

declare module 'react-native-svg' {
  import type { ComponentType } from 'react';
  import type { ViewProps } from 'react-native';

  interface SvgProps extends ViewProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    fill?: string;
    stroke?: string;
  }

  interface CommonPathProps {
    d?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeLinejoin?: 'miter' | 'round' | 'bevel';
    strokeDasharray?: string;
    opacity?: number | string;
  }

  interface PathProps extends CommonPathProps {
  }

  interface CircleProps extends CommonPathProps {
    cx?: number | string;
    cy?: number | string;
    r?: number | string;
  }

  interface RectProps extends CommonPathProps {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    rx?: number | string;
    ry?: number | string;
  }

  interface LineProps extends CommonPathProps {
    x1?: number | string;
    y1?: number | string;
    x2?: number | string;
    y2?: number | string;
  }

  interface GProps {
    children?: React.ReactNode;
    opacity?: number | string;
    fill?: string;
    stroke?: string;
    transform?: string;
  }

  interface TextSvgProps extends CommonPathProps {
    x?: number | string;
    y?: number | string;
    dx?: number | string;
    dy?: number | string;
    fontSize?: number | string;
    fontWeight?: string;
    textAnchor?: 'start' | 'middle' | 'end';
    children?: React.ReactNode;
  }

  const Svg: ComponentType<SvgProps>;
  const Path: ComponentType<PathProps>;
  const Circle: ComponentType<CircleProps>;
  const Rect: ComponentType<RectProps>;
  const Line: ComponentType<LineProps>;
  const G: ComponentType<GProps>;
  const Text: ComponentType<TextSvgProps>;

  export default Svg;
  export { Path, Circle, Rect, Line, G, Text };
}
