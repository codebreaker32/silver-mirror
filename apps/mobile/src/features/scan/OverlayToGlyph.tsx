import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { KeyProfile } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { glyphFromKey, zoneCaption } from '../key/model';
import { ZoneGlyph } from '../key/ZoneGlyph';
import { useReduceMotion } from './ui';

export const OVERLAY_HOLD_MS = 1500;

/** Shows the YouCam overlay from memory for under 2 s, then cross-fades to the photo-free glyph and drops it. */
export function OverlayToGlyph({ keyProfile, overlayBase64: overlay, onDropped }: { keyProfile: KeyProfile; overlayBase64: string | null; onDropped: () => void }) {
  const theme = useTheme();
  const reduced = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!overlay) return;
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: reduced ? theme.motion.reduced.duration : theme.motion.duration.enter,
        easing: Easing.bezier(...theme.motion.ease.exit),
        useNativeDriver: true,
      }).start(onDropped);
    }, OVERLAY_HOLD_MS);
    return () => clearTimeout(timer);
  }, [overlay, opacity, reduced, theme, onDropped]);

  return (
    <View>
      <ZoneGlyph model={glyphFromKey(keyProfile)} caption={zoneCaption(keyProfile)} />
      {overlay ? (
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity, borderRadius: theme.components.skinMap.radius, overflow: 'hidden', backgroundColor: theme.colors.inverseSurface }]}
          accessible
          accessibilityRole="image"
          accessibilityLabel="YouCam result overlay, shown for a moment and not saved"
        >
          <Image source={{ uri: `data:image/jpeg;base64,${overlay}` }} cachePolicy="none" contentFit="cover" style={{ flex: 1 }} />
          <View style={{ position: 'absolute', left: theme.space[3], bottom: theme.space[3], backgroundColor: theme.components.tryOnCompare.badge.bg, borderRadius: theme.components.tryOnCompare.badge.radius, paddingHorizontal: theme.space[2], paddingVertical: theme.space[1] }}>
            <Text style={[theme.components.tryOnCompare.badge.type, { color: theme.components.tryOnCompare.badge.fg }]}>YouCam result overlay · not saved</Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
