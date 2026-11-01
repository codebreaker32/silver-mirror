import { useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { deleteQuietly, encodeJpeg } from '../media';
import { Button } from '../ui';
import { contextClick } from '../haptics';

/** Fallback when the ML Kit document scanner isn't on the phone. The capture file is deleted after encoding. */
export function LabelCamera({ visible, onClose, onPhoto }: { visible: boolean; onClose: () => void; onPhoto: (base64: string) => void }) {
  const t = useTheme();
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
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={{ flex: 1, backgroundColor: t.colors.inverseSurface }}>
        {permission?.granted ? (
          <CameraView ref={camera} style={{ flex: 1 }} facing="back" />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', padding: t.spacing.gutter, gap: t.space[4] }}>
            <Text style={[t.type.headline, { color: t.colors.inverseText }]}>SkinKey needs the camera to read the ingredient list.</Text>
            <Button label="Allow camera" onPress={() => void requestPermission()} />
          </View>
        )}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingBottom: insets.bottom + t.space[4],
            paddingTop: t.space[4],
            backgroundColor: t.colors.overlayCamera,
            alignItems: 'center',
            gap: t.space[3],
          }}
        >
          <Text style={[t.type.bodySm, { color: t.colors.onOverlay, textAlign: 'center', paddingHorizontal: t.spacing.gutter }]}>
            Fill the frame with the ingredient list only.
          </Text>
          {permission?.granted ? (
            <Pressable
              onPress={shoot}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel="Take label photo"
              accessibilityState={{ busy }}
              style={{
                width: t.components.captureGuide.shutter.size,
                height: t.components.captureGuide.shutter.size,
                borderRadius: t.radius.full,
                borderWidth: t.components.captureGuide.shutter.ringWidth,
                borderColor: t.components.captureGuide.shutter.ring,
                backgroundColor: t.components.captureGuide.shutter.fill,
              }}
            />
          ) : null}
          <Pressable onPress={onClose} accessibilityRole="button" style={{ minHeight: t.touch.min, justifyContent: 'center', paddingHorizontal: t.space[4] }}>
            <Text style={[t.type.button, { color: t.colors.onOverlay }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
