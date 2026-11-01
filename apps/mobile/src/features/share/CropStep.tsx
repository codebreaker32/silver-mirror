import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Text, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { Image } from 'expo-image';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, Button } from '@/features/check/ui';
import { deleteQuietly, encodeJpeg, imageSize, type CropRect } from '@/features/check/media';

interface Props {
  uri: string;
  width: number | null;
  height: number | null;
  onCropped: (base64: string) => void;
  onCancel: () => void;
}

type Edge = 'top' | 'bottom';

/**
 * Screenshot shares: the user trims the image before anything reaches Claude (spec §9).
 * Top and bottom edges drag, since order and address details sit above or below the product.
 */
export function CropStep({ uri, width, height, onCropped, onCancel }: Props) {
  const t = useTheme();
  const win = useWindowDimensions();
  const [size, setSize] = useState(width && height ? { width, height } : null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [edges, setEdges] = useState({ top: 0.15, bottom: 0.85 });
  const [busy, setBusy] = useState(false);
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  useEffect(() => {
    if (!size) imageSize(uri).then(setSize).catch(() => setSize({ width: 1080, height: 1920 }));
  }, [uri, size]);

  const display = useMemo(() => {
    if (!size || !box.w || !box.h) return null;
    const scale = Math.min(box.w / size.width, box.h / size.height);
    return { w: size.width * scale, h: size.height * scale };
  }, [size, box]);

  const minGap = 0.1;
  const start = useRef(0);
  const responder = (edge: Edge) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        start.current = edgesRef.current[edge];
      },
      onPanResponderMove: (_, g) => {
        if (!display) return;
        const next = start.current + g.dy / display.h;
        setEdges((e) =>
          edge === 'top'
            ? { ...e, top: Math.max(0, Math.min(next, e.bottom - minGap)) }
            : { ...e, bottom: Math.min(1, Math.max(next, e.top + minGap)) },
        );
      },
    });
  const topResponder = useMemo(() => responder('top'), [display]);
  const bottomResponder = useMemo(() => responder('bottom'), [display]);

  const nudge = (edge: Edge, delta: number) =>
    setEdges((e) =>
      edge === 'top'
        ? { ...e, top: Math.max(0, Math.min(e.top + delta, e.bottom - minGap)) }
        : { ...e, bottom: Math.min(1, Math.max(e.bottom + delta, e.top + minGap)) },
    );

  const send = async () => {
    if (!size) return;
    setBusy(true);
    const crop: CropRect = {
      originX: 0,
      originY: Math.round(edges.top * size.height),
      width: size.width,
      height: Math.round((edges.bottom - edges.top) * size.height),
    };
    try {
      const base64 = await encodeJpeg(uri, { crop, maxWidth: 1080 });
      deleteQuietly(uri);
      onCropped(base64);
    } catch {
      setBusy(false);
    }
  };

  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const handle = (edge: Edge) => {
    const y = display ? (edge === 'top' ? edges.top : edges.bottom) * display.h : 0;
    const handlers = edge === 'top' ? topResponder.panHandlers : bottomResponder.panHandlers;
    return (
      <View
        {...handlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={edge === 'top' ? 'Top crop edge' : 'Bottom crop edge'}
        accessibilityValue={{ text: `${Math.round((edge === 'top' ? edges.top : edges.bottom) * 100)}% down the screenshot` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(ev) => nudge(edge, ev.nativeEvent.actionName === 'increment' ? 0.05 : -0.05)}
        style={{ position: 'absolute', left: 0, right: 0, top: y - t.touch.min / 2, height: t.touch.min, justifyContent: 'center' }}
      >
        <View style={{ height: 3, backgroundColor: t.colors.onOverlay }} />
        <View
          style={{
            position: 'absolute',
            alignSelf: 'center',
            width: t.space[12],
            height: t.space[2],
            borderRadius: t.radius.full,
            backgroundColor: t.colors.onOverlay,
          }}
        />
      </View>
    );
  };

  return (
    <View testID="crop-step" style={{ flex: 1, gap: t.space[4], paddingHorizontal: t.spacing.gutter, paddingBottom: t.space[4] }}>
      <Text accessibilityRole="header" style={[t.type.title, { color: t.colors.text }]}>
        {COPY.cropWarning}
      </Text>
      <Body muted>Drag the top and bottom edges so only the product name and details show. Only the part inside is sent to read the listing.</Body>
      <View onLayout={onLayout} style={{ flex: 1, minHeight: win.height * 0.4, alignItems: 'center', justifyContent: 'center' }}>
        {display ? (
          <View style={{ width: display.w, height: display.h }}>
            <Image source={{ uri }} style={{ width: display.w, height: display.h }} contentFit="contain" cachePolicy="none" accessibilityLabel="Shared screenshot" />
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: edges.top * display.h, backgroundColor: t.colors.overlayCamera }} />
            <View style={{ position: 'absolute', left: 0, right: 0, top: edges.bottom * display.h, bottom: 0, backgroundColor: t.colors.overlayCamera }} />
            {handle('top')}
            {handle('bottom')}
          </View>
        ) : null}
      </View>
      <Button label="Use this part" onPress={send} busy={busy} busyLabel="Preparing…" disabled={!display} testID="crop-send" />
      <Button
        label="Cancel"
        variant="tertiary"
        onPress={() => {
          deleteQuietly(uri);
          onCancel();
        }}
      />
    </View>
  );
}
