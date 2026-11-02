import { useRef, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COPY } from '@skinkey/contracts';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { IconButton, PillButton, Txt } from '@/components';
import { deleteQuietly, encodeJpeg } from '../media';
import { contextClick } from '../haptics';

/** Four white corner brackets (captureGuide.bracket*) framing the label. Decorative. */
function Brackets() {
  const t = useTheme();
  const g = t.components.captureGuide;
  const arm = { position: 'absolute' as const, width: g.bracketLength, height: g.bracketLength, borderColor: g.bracket };
  const w = g.bracketWidth;
  const r = g.frameRadius;
  return (
    <View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ position: 'absolute', top: '18%', bottom: '30%', left: '8%', right: '8%' }}
    >
      <View style={[arm, { top: 0, left: 0, borderTopWidth: w, borderLeftWidth: w, borderTopLeftRadius: r }]} />
      <View style={[arm, { top: 0, right: 0, borderTopWidth: w, borderRightWidth: w, borderTopRightRadius: r }]} />
      <View style={[arm, { bottom: 0, left: 0, borderBottomWidth: w, borderLeftWidth: w, borderBottomLeftRadius: r }]} />
      <View style={[arm, { bottom: 0, right: 0, borderBottomWidth: w, borderRightWidth: w, borderBottomRightRadius: r }]} />
    </View>
  );
}

function CameraBody({ onClose, onPhoto }: { onClose: () => void; onPhoto: (base64: string) => void }) {
  const t = useTheme();
  const g = t.components.captureGuide;
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);

  const shoot = async () => {
    if (!camera.current || busy) return;
    setBusy(true);
    let uri: string | undefined;
    try {
      void contextClick();
      const pic = await camera.current.takePictureAsync({ quality: 0.8, shutterSound: false });
      uri = pic.uri;
      onPhoto(await encodeJpeg(pic.uri, { maxWidth: 1600 }));
      onClose();
    } catch {
      setBusy(false);
    } finally {
      deleteQuietly(uri);
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {permission?.granted ? (
        <View style={{ flex: 1 }}>
          <CameraView ref={camera} style={{ flex: 1 }} facing="back" />
          <Brackets />
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', padding: t.spacing.gutter, gap: t.space[5] }}>
          <Txt accessibilityRole="header" variant="title">
            {COPY.appName} needs the camera to read the ingredient list.
          </Txt>
          <PillButton label="Allow camera" leadingIcon="camera" onPress={() => void requestPermission()} />
        </View>
      )}
      <View style={{ position: 'absolute', top: insets.top + t.space[2], left: t.space[2] }}>
        <IconButton icon="close" variant={permission?.granted ? 'overlay' : 'plain'} accessibilityLabel="Cancel" onPress={onClose} />
      </View>
      {permission?.granted ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingBottom: insets.bottom + t.space[4],
            paddingTop: t.space[4],
            backgroundColor: g.overlay,
            alignItems: 'center',
            gap: t.space[3],
          }}
        >
          <View style={{ backgroundColor: g.hint.bg, borderRadius: g.hint.radius, paddingHorizontal: g.hint.paddingX, minHeight: g.hint.visualMinHeight, justifyContent: 'center' }}>
            <Txt variant="label" style={[g.instruction, { color: g.instructionColor, textAlign: 'center' }]}>
              Fill the frame with the ingredient list only.
            </Txt>
          </View>
          <Pressable
            onPress={shoot}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Take label photo"
            accessibilityState={{ busy }}
            style={({ pressed }) => ({
              width: g.shutter.size,
              height: g.shutter.size,
              borderRadius: t.radius.full,
              borderWidth: g.shutter.ringWidth,
              borderColor: g.shutter.ring,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <View style={{ width: g.shutter.size - 16, height: g.shutter.size - 16, borderRadius: t.radius.full, backgroundColor: g.shutter.fill, opacity: busy ? 0.5 : 1 }} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

/**
 * Fallback when the ML Kit document scanner isn't on the phone. Always the dark camera surface (both themes), white
 * brackets and a 72dp shutter ring. The capture file is deleted after encoding.
 */
export function LabelCamera({ visible, onClose, onPhoto }: { visible: boolean; onClose: () => void; onPhoto: (base64: string) => void }) {
  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <ThemeProvider scheme="dark">
        <CameraBody onClose={onClose} onPhoto={onPhoto} />
      </ThemeProvider>
    </Modal>
  );
}
