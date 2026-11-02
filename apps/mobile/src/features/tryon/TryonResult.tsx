import { View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Ellipse } from 'react-native-svg';
import { FaceFrame, SheenBackdrop } from '@/brand';
import { COPY, type TryonStatusResponse } from '@skinkey/contracts';
import { Body, Chip, Icon, Txt } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { deleteStateLabel } from '../scan/deleteCopy';

export const SINGLE_CAPTION = 'Preview, not a shade guarantee.';

/**
 * Drawn stand-in for a render (web `?demo=` only, where no photo exists): the face-frame plate on the sheen with the
 * oval washed in a lighter or deeper token tone, labelled "Sample preview". Never a face, never raster.
 */
function SamplePreview({ index }: { index: number }) {
  const theme = useTheme();
  const w = 112;
  // Two token tones of one ink: a light wash and a deeper one, so the pair reads as two shades.
  const opacity = index % 2 ? 0.55 : 0.2;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <SheenBackdrop />
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
 * Two equal portrait cards from the same photo, a shade chip under each, and the fixed caption on the plain surface
 * below, always visible. No slider, no Save, no swatch of the user's own tone.
 */
export function TryonResult({ status }: { status: TryonStatusResponse }) {
  const theme = useTheme();
  const t = theme.components.tryOnCompare;
  const caption = status.renders.length >= 2 ? COPY.tryonCaption : SINGLE_CAPTION;
  const deleted = status.deleteState === 'deleted';
  return (
    <View style={{ gap: theme.space[4] }}>
      <View style={{ flexDirection: 'row', gap: theme.space[3] }}>
        {status.renders.map((r, i) => (
          <View key={r.shadeName} style={{ flex: 1, gap: theme.space[2] }}>
            <View style={{ aspectRatio: 3 / 4, borderRadius: t.radius, overflow: 'hidden', backgroundColor: theme.colors.bgSunken, borderWidth: 1, borderColor: t.frameBorder }}>
              {!r.imageBase64 ? (
                <SamplePreview index={i} />
              ) : (
              <Image
                source={{ uri: `data:image/jpeg;base64,${r.imageBase64}` }}
                cachePolicy="none"
                contentFit="cover"
                style={{ flex: 1 }}
                accessibilityLabel={`Your photo with a ${r.shadeName} preview`}
              />
              )}
            </View>
            <Chip label={r.shadeName} accessibilityLabel={`Shade: ${r.shadeName}`} />
          </View>
        ))}
      </View>
      <Txt variant="bodyStrong" style={{ color: t.disclaimerColor }}>
        {caption}
      </Txt>
      <View accessible style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
        <Icon name={deleted ? 'check-circle' : 'info'} size={theme.icon.md} color={theme.colors.text} />
        <Txt variant="label" style={{ flex: 1 }}>
          {deleteStateLabel(status.deleteState)}
        </Txt>
      </View>
      <Body muted small>
        Not saved. These previews disappear when you close this screen.
      </Body>
    </View>
  );
}
