import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { COPY, type TryonStatusResponse } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { deleteStateLabel } from '../scan/deleteCopy';
import { Body } from '../scan/ui';

export const SINGLE_CAPTION = 'Preview, not a shade guarantee.';

export function TryonResult({ status }: { status: TryonStatusResponse }) {
  const theme = useTheme();
  const t = theme.components.tryOnCompare;
  const caption = status.renders.length >= 2 ? COPY.tryonCaption : SINGLE_CAPTION;
  return (
    <View style={{ gap: theme.space[4] }}>
      <View style={{ flexDirection: 'row', gap: theme.space[2] }}>
        {status.renders.map((r) => (
          <View key={r.shadeName} style={{ flex: 1, gap: theme.space[2] }}>
            <View style={{ aspectRatio: 3 / 4, borderRadius: t.radius, overflow: 'hidden', backgroundColor: theme.colors.bgSunken }}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${r.imageBase64}` }}
                cachePolicy="none"
                contentFit="cover"
                style={{ flex: 1 }}
                accessibilityLabel={`Your photo with a ${r.shadeName} preview`}
              />
            </View>
            <View
              style={{
                alignSelf: 'flex-start',
                minHeight: theme.components.tag.visualMinHeight,
                paddingHorizontal: theme.components.tag.paddingX,
                borderRadius: theme.components.tag.radius,
                backgroundColor: theme.components.tag.bg,
                justifyContent: 'center',
              }}
            >
              <Text style={[theme.components.tag.type, { color: theme.components.tag.fg }]}>{r.shadeName}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={[theme.type.label, { color: t.disclaimerColor }]}>{caption}</Text>
      <Text style={[theme.type.label, { color: theme.colors.text }]}>{deleteStateLabel(status.deleteState)}</Text>
      <Body muted small>
        Not saved. These previews disappear when you close this screen.
      </Body>
    </View>
  );
}
