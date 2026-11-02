import { View } from 'react-native';
import { Image } from 'expo-image';
import { COPY, type TryonStatusResponse } from '@skinkey/contracts';
import { Body, Chip, Icon, Txt } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { deleteStateLabel } from '../scan/deleteCopy';

export const SINGLE_CAPTION = 'Preview, not a shade guarantee.';

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
        {status.renders.map((r) => (
          <View key={r.shadeName} style={{ flex: 1, gap: theme.space[2] }}>
            <View style={{ aspectRatio: 3 / 4, borderRadius: t.radius, overflow: 'hidden', backgroundColor: theme.colors.bgSunken, borderWidth: 1, borderColor: t.frameBorder }}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${r.imageBase64}` }}
                cachePolicy="none"
                contentFit="cover"
                style={{ flex: 1 }}
                accessibilityLabel={`Your photo with a ${r.shadeName} preview`}
              />
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
