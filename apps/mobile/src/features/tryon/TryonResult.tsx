import { View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Ellipse } from 'react-native-svg';
import { FaceFrame } from '@/brand';
import { COPY, type TryonStatusResponse } from '@skinkey/contracts';
import { Body, Chip, StepChecklist, Txt, useCardStyle } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import type { DisplayStep } from '../scan/steps';

export const SINGLE_CAPTION = 'Preview, not a shade guarantee.';

/**
 * Drawn stand-in for a render (web `?demo=` only, where no photo exists): the face-frame plate in the well with the
 * oval washed in a lighter or deeper token tone, labelled "Sample preview". Never a face, never raster.
 */
function SamplePreview({ index }: { index: number }) {
  const theme = useTheme();
  const w = 112;
  // Two token tones of one ink: a light wash and a deeper one, so the pair reads as two shades.
  const opacity = index % 2 ? 0.55 : 0.2;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width="70%" height="70%" viewBox="0 0 100 133" style={{ position: 'absolute' }}>
        <Ellipse cx={50} cy={66} rx={24} ry={45} fill={theme.colors.textMuted} fillOpacity={opacity} />
      </Svg>
      <FaceFrame width={w} tile={false} dots={false} />
      <View style={{ position: 'absolute', top: theme.space[2], left: theme.space[2], paddingHorizontal: theme.space[2], paddingVertical: 2, borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceRaised }}>
        <Txt variant="caption">Sample preview</Txt>
      </View>
    </View>
  );
}

/**
 * Result (DESIGN.md §9.11, showcase 04_report card language): two shade cards side by side from the same photo
 * (white radius-24 cards; the image sits in a thumb-tile well, radius 20; the shade chip under it keeps the
 * "Shade: …" label), the fixed caption on the plain surface below, always visible, then the real steps as the
 * checklist card ending in the delete row. No slider, no Save, no swatch of the user's own tone.
 */
export function TryonResult({ status, steps }: { status: TryonStatusResponse; steps: readonly DisplayStep[] }) {
  const theme = useTheme();
  // The mock Worker returns a placeholder image, not the user's photo: say so to TalkBack too.
  const imageLabel = (shade: string) => (status.ledger.mock ? `Mock render placeholder for ${shade} (test, not your photo)` : `Your photo with a ${shade} preview`);
  const t = theme.components.tryOnCompare;
  const card = useCardStyle('raised');
  const caption = status.renders.length >= 2 ? COPY.tryonCaption : SINGLE_CAPTION;
  const wellRadius = theme.radius.md;
  return (
    <View style={{ gap: theme.space[5] }}>
      <View style={{ flexDirection: 'row', gap: theme.space[3] }}>
        {status.renders.map((r, i) => (
          <View key={r.shadeName} style={[card, { flex: 1, padding: theme.space[2], gap: theme.space[2] }]}>
            <View
              style={{
                aspectRatio: 3 / 4,
                borderRadius: wellRadius,
                overflow: 'hidden',
                backgroundColor: theme.components.listRow.thumbBg,
              }}
            >
              {!r.imageBase64 ? (
                <SamplePreview index={i} />
              ) : (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${r.imageBase64}` }}
                  cachePolicy="none"
                  contentFit="cover"
                  style={{ flex: 1 }}
                  accessibilityLabel={imageLabel(r.shadeName)}
                />
              )}
            </View>
            <View style={{ paddingHorizontal: theme.space[1], paddingBottom: theme.space[1] }}>
              <Chip label={r.shadeName} accessibilityLabel={`Shade: ${r.shadeName}`} />
            </View>
          </View>
        ))}
      </View>
      <Txt variant="bodyStrong" style={{ color: t.disclaimerColor }}>
        {caption}
      </Txt>
      {steps.length ? <StepChecklist steps={steps} /> : null}
      <Body muted small>
        Not saved. These previews disappear when you close this screen.
      </Body>
    </View>
  );
}
