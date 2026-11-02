import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { SheenBackdrop } from './SheenBackdrop';

interface FaceFrameProps {
  width: number;
  /**
   * 0 = brackets at rest (open), 1 = closed in. ProcessingScreen drives this per completed step
   * (motion.patterns.bracketResolve); everything else leaves it at 0.
   */
  progress?: number;
  /** Faint dot grid inside the oval. Never drawn over a real face. */
  dots?: boolean;
  /** Draw its own sheen tile (default). Off when the frame already sits on a sheen plate: no card inside a card. */
  tile?: boolean;
}

/**
 * Face-frame illustration (component.faceFrame): sheen plate, four corner brackets, a faint oval.
 * No face, no photo, no mesh over a person. Decorative: the screen's text says what is happening.
 */
export function FaceFrame({ width, progress = 0, dots = true, tile = true }: FaceFrameProps) {
  const theme = useTheme();
  const f = theme.components.faceFrame;
  const height = Math.round(width / f.aspect);
  const w = 100;
  const h = Math.round(100 / f.aspect);
  const inset = 10 + Math.min(1, Math.max(0, progress)) * 4;
  const L = (f.bracketLength / width) * w;
  const stroke = (f.bracketWidth / width) * w;
  const corners = [
    `M${inset} ${inset + L}V${inset + 6}a6 6 0 0 1 6 -6H${inset + L}`,
    `M${w - inset - L} ${inset}H${w - inset - 6}a6 6 0 0 1 6 6V${inset + L}`,
    `M${w - inset} ${h - inset - L}V${h - inset - 6}a6 6 0 0 1 -6 6H${w - inset - L}`,
    `M${inset + L} ${h - inset}H${inset + 6}a6 6 0 0 1 -6 -6V${h - inset - L}`,
  ];
  const grid: { x: number; y: number }[] = [];
  if (dots) {
    for (let y = 30; y <= h - 30; y += 7) for (let x = 32; x <= 68; x += 7) {
      const dx = (x - 50) / 22;
      const dy = (y - h / 2) / (h * 0.32);
      if (dx * dx + dy * dy <= 1) grid.push({ x, y });
    }
  }
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width, height, borderRadius: f.radius, overflow: 'hidden', backgroundColor: tile ? f.bg : undefined }}
    >
      {tile ? <SheenBackdrop radius={f.radius} /> : null}
      {/* Positioned after the sheen so it paints above it on web too (an absolute sibling otherwise covers static SVG). */}
      <Svg width={width} height={height} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Ellipse cx={50} cy={h / 2} rx={24} ry={h * 0.34} stroke={f.oval} strokeWidth={(f.ovalWidth / width) * w} fill="none" />
        {grid.map((p) => (
          <Circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r={0.6} fill={f.dots} opacity={f.dotsOpacity} />
        ))}
        {corners.map((d) => (
          <Path key={d} d={d} stroke={f.bracket} strokeWidth={stroke} strokeLinecap="round" fill="none" />
        ))}
      </Svg>
    </View>
  );
}
