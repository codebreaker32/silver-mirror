import { useId } from 'react';
import Svg, { Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import {
  CHROME_GRADIENT,
  MARK_VIEWBOX,
  S_GLINTS,
  S_GLINT_OPACITY,
  S_GLINT_STROKE,
  S_PATH,
  S_SHADE_OFFSET,
  S_SHADE_OPACITY,
  S_STROKE,
  TILE_EDGE_STROKE,
  TILE_GRADIENT,
  TILE_HIGHLIGHT,
  TILE_RADIUS,
} from './geometry';

interface SilverMarkProps {
  /** Rendered size in dp. Minimum 24 (component.brand rule). */
  size: number;
  /** Draw the pearl (light) / graphite (dark) tile behind the S. Off = the bare chrome S, e.g. on the sheen hero. */
  tile?: boolean;
  /**
   * The mark is decorative next to the wordmark (the default). Pass a label only when the mark
   * stands alone, e.g. the tile highlighted inside the share-sheet illustration.
   */
  accessibilityLabel?: string;
}

/**
 * The chrome-S swirl. Vector only (no raster), tokens only (theme.colors.mark), no SVG filters.
 * Gradient ids are per instance so several marks can share a screen.
 */
export function SilverMark({ size, tile = true, accessibilityLabel }: SilverMarkProps) {
  const { colors, dark } = useTheme();
  const m = colors.mark;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const chromeId = `smChrome${uid}`;
  const tileId = `smTile${uid}`;
  const hiId = `smHi${uid}`;
  const a11y = accessibilityLabel
    ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel }
    : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const };

  return (
    <Svg width={Math.max(24, size)} height={Math.max(24, size)} viewBox={`0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}`} {...a11y}>
      <Defs>
        <LinearGradient
          id={chromeId}
          gradientUnits="userSpaceOnUse"
          x1={CHROME_GRADIENT.x1}
          y1={CHROME_GRADIENT.y1}
          x2={CHROME_GRADIENT.x2}
          y2={CHROME_GRADIENT.y2}
        >
          {CHROME_GRADIENT.stops.map((s, i) => (
            <Stop key={i} offset={s.offset} stopColor={m[s.role]} />
          ))}
        </LinearGradient>
        <LinearGradient
          id={tileId}
          gradientUnits="userSpaceOnUse"
          x1={TILE_GRADIENT.x1}
          y1={TILE_GRADIENT.y1}
          x2={TILE_GRADIENT.x2}
          y2={TILE_GRADIENT.y2}
        >
          {TILE_GRADIENT.stops.map((s, i) => (
            <Stop key={i} offset={s.offset} stopColor={m[s.role]} />
          ))}
        </LinearGradient>
        <RadialGradient id={hiId} gradientUnits="userSpaceOnUse" cx={TILE_HIGHLIGHT.cx} cy={TILE_HIGHLIGHT.cy} r={TILE_HIGHLIGHT.r}>
          <Stop offset={0} stopColor={m.glint} stopOpacity={dark ? TILE_HIGHLIGHT.opacityDark : TILE_HIGHLIGHT.opacity} />
          <Stop offset={1} stopColor={m.glint} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {tile && (
        <G>
          <Rect x={0} y={0} width={MARK_VIEWBOX} height={MARK_VIEWBOX} rx={TILE_RADIUS} fill={`url(#${tileId})`} />
          <Rect x={0} y={0} width={MARK_VIEWBOX} height={MARK_VIEWBOX} rx={TILE_RADIUS} fill={`url(#${hiId})`} />
          <Rect
            x={TILE_EDGE_STROKE / 2}
            y={TILE_EDGE_STROKE / 2}
            width={MARK_VIEWBOX - TILE_EDGE_STROKE}
            height={MARK_VIEWBOX - TILE_EDGE_STROKE}
            rx={TILE_RADIUS}
            fill="none"
            stroke={m.tileEdge}
            strokeWidth={TILE_EDGE_STROKE}
          />
        </G>
      )}
      <Path
        d={S_PATH}
        transform={`translate(${S_SHADE_OFFSET.x} ${S_SHADE_OFFSET.y})`}
        stroke={m.shade}
        strokeOpacity={S_SHADE_OPACITY}
        strokeWidth={S_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path d={S_PATH} stroke={`url(#${chromeId})`} strokeWidth={S_STROKE} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {S_GLINTS.map((d) => (
        <Path
          key={d}
          d={d}
          stroke={m.glint}
          strokeOpacity={S_GLINT_OPACITY}
          strokeWidth={S_GLINT_STROKE}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </Svg>
  );
}
