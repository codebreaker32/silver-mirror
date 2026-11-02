import { useId } from 'react';
import { Text, View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path, Pattern, Rect } from 'react-native-svg';
import type { Band } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import type { GlyphModel, GlyphZone } from './model';

const SHAPES: Record<GlyphZone, { cx: number; cy: number; rx: number; ry: number }> = {
  forehead: { cx: 100, cy: 62, rx: 46, ry: 20 },
  nose: { cx: 100, cy: 114, rx: 12, ry: 26 },
  leftCheek: { cx: 60, cy: 130, rx: 20, ry: 24 },
  rightCheek: { cx: 140, cy: 130, rx: 20, ry: 24 },
  chin: { cx: 100, cy: 178, rx: 26, ry: 13 },
};

interface Props {
  model: GlyphModel;
  highlight?: readonly GlyphZone[];
  width?: number;
  showLegend?: boolean;
  caption?: string;
}

/**
 * Hatch lines for a legend swatch, clipped by hand to the swatch box. Each legend swatch is its own <Svg>, and
 * react-native-svg does not resolve url(#pattern) across Svg roots on Android, so the swatches draw real lines.
 * Medium = one diagonal direction (like the map's single hatch), High = cross-hatch.
 */
function swatchHatch(band: Band, x0: number, y0: number, x1: number, y1: number): [number, number, number, number][] {
  const step = band === 'High' ? 3 : 4;
  const out: [number, number, number, number][] = [];
  // "/" lines: x + y = c
  for (let c = x0 + y0 + step; c < x1 + y1; c += step) {
    const sx = Math.max(x0, c - y1);
    const ex = Math.min(x1, c - y0);
    if (ex > sx) out.push([sx, c - sx, ex, c - ex]);
  }
  if (band === 'High') {
    // "\\" lines: x - y = c
    for (let c = x0 - y1 + step; c < x1 - y0; c += step) {
      const sx = Math.max(x0, c + y0);
      const ex = Math.min(x1, c + y1);
      if (ex > sx) out.push([sx, sx - c, ex, ex - c]);
    }
  }
  return out;
}

function usePatternIds() {
  const base = useId().replace(/[^a-zA-Z0-9]/g, '');
  return { medium: `hm${base}`, high: `hh${base}` };
}

export function ZoneGlyph({ model, highlight = [], width = 200, showLegend = true, caption }: Props) {
  const theme = useTheme();
  const m = theme.components.skinMap;
  const ink = theme.components.bandChip.meter.filled;
  const ids = usePatternIds();
  const height = (width * 240) / 200;

  const fillFor = (band: Band | null) =>
    band === 'High' ? `url(#${ids.high})` : band === 'Medium' ? `url(#${ids.medium})` : 'none';

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={[model.accessibilityLabel, ...model.lines].join(' ')}
      style={{
        backgroundColor: m.bg,
        borderRadius: m.radius,
        borderWidth: 1,
        borderColor: m.border,
        borderTopColor: theme.dark ? theme.colors.sheenEdge : m.border,
        padding: m.padding,
        gap: theme.space[3],
        alignItems: 'center',
      }}
    >
      <Text {...theme.textProps.section} style={[theme.typography.section, { color: m.labelColor, alignSelf: 'flex-start' }]}>
        {model.title}
      </Text>
      <Svg width={width} height={height} viewBox="0 0 200 240">
        <Defs>
          <Pattern id={ids.medium} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
            <Line x1={0} y1={0} x2={0} y2={6} stroke={ink} strokeWidth={1} />
          </Pattern>
          <Pattern id={ids.high} patternUnits="userSpaceOnUse" width={4} height={4} patternTransform="rotate(45)">
            <Line x1={0} y1={0} x2={0} y2={4} stroke={ink} strokeWidth={1} />
            <Line x1={0} y1={0} x2={4} y2={0} stroke={ink} strokeWidth={1} />
          </Pattern>
        </Defs>
        <Path d="M76 196 L72 236 M124 196 L128 236" stroke={m.faceOutline} strokeWidth={m.faceStrokeWidth} strokeLinecap="round" fill="none" />
        <Ellipse cx={100} cy={112} rx={72} ry={92} stroke={m.faceOutline} strokeWidth={m.faceStrokeWidth} fill="none" />
        <Line x1={100} y1={24} x2={100} y2={200} stroke={m.faceOutline} strokeWidth={0.75} strokeDasharray="2 5" />
        {(Object.keys(SHAPES) as GlyphZone[]).map((zone) => {
          const s = SHAPES[zone];
          const band = model.zones[zone];
          const lit = highlight.includes(zone);
          return (
            <G key={zone}>
              {lit ? <Ellipse {...s} fill={m.hatch} fillOpacity={0.12} /> : null}
              <Ellipse
                {...s}
                fill={fillFor(band)}
                stroke={m.zoneStroke}
                strokeWidth={lit ? m.zoneStrokeWidth * 2 : m.zoneStrokeWidth}
                strokeDasharray={band === null ? '3 3' : undefined}
              />
            </G>
          );
        })}
      </Svg>
      {showLegend ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[3], alignSelf: 'flex-start' }} importantForAccessibility="no-hide-descendants">
          {(['Low', 'Medium', 'High'] as const).map((b) => (
            <View key={b} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[1] }}>
              <Svg width={16} height={12} viewBox="0 0 16 12">
                {b === 'Low'
                  ? null
                  : swatchHatch(b, 1, 1, 15, 11).map(([x1, y1, x2, y2], i) => (
                      <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={1} />
                    ))}
                <Rect x={0.5} y={0.5} width={15} height={11} rx={2} fill="none" stroke={m.zoneStroke} strokeWidth={1} />
              </Svg>
              <Text style={[theme.type.caption, { color: theme.colors.textMuted }]}>{b}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[1] }}>
            <Svg width={16} height={12} viewBox="0 0 16 12">
              <Rect x={0.5} y={0.5} width={15} height={11} rx={2} fill="none" stroke={m.zoneStroke} strokeWidth={1} strokeDasharray="3 3" />
            </Svg>
            <Text style={[theme.type.caption, { color: theme.colors.textMuted }]}>Not measured</Text>
          </View>
        </View>
      ) : null}
      {model.lines.length > 0 ? (
        <View style={{ alignSelf: 'stretch', gap: theme.space[1] }} importantForAccessibility="no-hide-descendants">
          {model.lines.map((line) => (
            <Text key={line} style={[theme.type.bodySm, { color: theme.colors.text }]}>
              {line}
            </Text>
          ))}
        </View>
      ) : null}
      {caption ? <Text style={[theme.type.caption, { color: theme.colors.textMuted, alignSelf: 'flex-start' }]}>{caption}</Text> : null}
    </View>
  );
}
