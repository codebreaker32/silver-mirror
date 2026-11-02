import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { CAPTURE_TIPS, LIGHT_HINT } from './captureHints';
import { deleteLocal } from './native';
import { pickPictureSize } from './pictureSize';
import { COPY } from '@skinkey/contracts';
import { Body, Button, ButtonPair, EmptyState, IconButton, Screen, Tag, haptic, useReduceMotion } from '@/components';

export interface CapturedPhoto {
  uri: string;
  width: number;
  height: number;
}

interface Props {
  variant: 'scan' | 'tryon';
  hint?: string | null;
  onCaptured: (photo: CapturedPhoto) => void;
  onCancel: () => void;
}

/**
 * Camera overlay in dp: dims outside the 72% oval, draws the faint oval and the four white corner brackets
 * (captureGuide.bracket*), and masks the frame corners to frameRadius so the live preview reads as a rounded frame
 * even where the native preview ignores overflow clipping. The surround is captureGuide.surround (dark in both themes):
 * inverse-surface is near-white in dark mode and hid the white Back chevron and shutter ring.
 */
function FrameOverlay({ width, height }: { width: number; height: number }) {
  const theme = useTheme();
  const g = theme.components.captureGuide;
  const rx = (width * g.ovalWidthPct) / 100 / 2;
  const ry = rx / g.ovalAspect;
  const cx = width / 2;
  const cy = height * 0.45;
  const oval = `M0 0H${width}V${height}H0Z M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  const r = g.frameRadius;
  const corners = `M0 0H${width}V${height}H0Z M${r} 0H${width - r}A${r} ${r} 0 0 1 ${width} ${r}V${height - r}A${r} ${r} 0 0 1 ${width - r} ${height}H${r}A${r} ${r} 0 0 1 0 ${height - r}V${r}A${r} ${r} 0 0 1 ${r} 0Z`;
  const i = theme.space[4];
  const L = g.bracketLength;
  const a = theme.space[2];
  const brackets = [
    `M${i} ${i + L}V${i + a}A${a} ${a} 0 0 1 ${i + a} ${i}H${i + L}`,
    `M${width - i - L} ${i}H${width - i - a}A${a} ${a} 0 0 1 ${width - i} ${i + a}V${i + L}`,
    `M${width - i} ${height - i - L}V${height - i - a}A${a} ${a} 0 0 1 ${width - i - a} ${height - i}H${width - i - L}`,
    `M${i + L} ${height - i}H${i + a}A${a} ${a} 0 0 1 ${i} ${height - i - a}V${height - i - L}`,
  ];
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path d={oval} fill={g.overlay} fillRule="evenodd" />
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke={g.oval} strokeWidth={g.ovalStrokeWidth} fill="none" />
      {brackets.map((d) => (
        <Path key={d} d={d} stroke={g.bracket} strokeWidth={g.bracketWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ))}
      <Path d={corners} fill={g.surround} fillRule="evenodd" />
    </Svg>
  );
}

const TIPS: readonly string[] = [...CAPTURE_TIPS, LIGHT_HINT];

export function CaptureGuide({ variant, hint, onCaptured, onCancel }: Props) {
  const theme = useTheme();
  const g = theme.components.captureGuide;
  const media = theme.colors.onOverlay;
  const reduced = useReduceMotion();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [pictureSize, setPictureSize] = useState<string | undefined>();
  const [ready, setReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [capturing, setCapturing] = useState(false);
  const [review, setReview] = useState<CapturedPhoto | null>(null);
  const [tip, setTip] = useState<number | null>(null);
  const reviewRef = useRef<CapturedPhoto | null>(null);
  reviewRef.current = review;

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) void requestPermission();
  }, [permission, requestPermission]);

  useEffect(() => () => {
    if (reviewRef.current) deleteLocal(reviewRef.current.uri);
  }, []);

  const onReady = async () => {
    setReady(true);
    try {
      const sizes = (await camera.current?.getAvailablePictureSizesAsync()) ?? [];
      setPictureSize(pickPictureSize(sizes));
    } catch {
      setPictureSize(undefined);
    }
  };

  // A device (or emulator) with no front lens fails to bind and the viewfinder stays black. Fall back to the back
  // camera once instead; the flip button still lets the user try the front again.
  const triedBack = useRef(false);
  const onMountError = () => {
    setReady(false);
    if (facing === 'front' && !triedBack.current) {
      triedBack.current = true;
      setFacing('back');
    }
  };

  const shoot = async () => {
    if (!camera.current || capturing) return;
    setCapturing(true);
    haptic('contextClick');
    try {
      const photo = await camera.current.takePictureAsync({ quality: 0.9, exif: false });
      if (photo) setReview({ uri: photo.uri, width: photo.width, height: photo.height });
    } catch {
      haptic('reject');
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) return <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />;

  if (!permission.granted) {
    return (
      <Screen onBack={onCancel}>
        <EmptyState title="Camera needed" body={`${COPY.appName} needs the camera to take one photo for YouCam to analyse.`} plate="face">
          <Button label="Open settings" onPress={() => void Linking.openSettings()} />
          <Button label="Not now" variant="secondary" onPress={onCancel} />
        </EmptyState>
      </Screen>
    );
  }

  if (review) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View
          style={{
            flex: 1,
            margin: theme.spacing.gutter,
            marginBottom: 0,
            borderRadius: g.frameRadius,
            overflow: 'hidden',
            backgroundColor: theme.colors.bgSunken,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Image source={{ uri: review.uri }} cachePolicy="none" contentFit="contain" style={{ flex: 1 }} accessibilityLabel="The photo you just took" />
        </View>
        <View style={{ padding: theme.spacing.gutter, gap: theme.space[3] }}>
          <Body muted small>
            {variant === 'scan' ? 'Only this photo goes to YouCam. It is deleted from this phone as soon as it is uploaded.' : 'Only this photo goes to YouCam for the preview.'}
          </Body>
          <ButtonPair>
            <Button
              label="Retake"
              variant="secondary"
              onPress={() => {
                deleteLocal(review.uri);
                setReview(null);
              }}
            />
            <Button
              label="Use photo"
              onPress={() => {
                const photo = review;
                reviewRef.current = null;
                setReview(null);
                onCaptured(photo);
              }}
            />
          </ButtonPair>
        </View>
      </SafeAreaView>
    );
  }

  const onLayout = (e: LayoutChangeEvent) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
  const message = tip !== null ? TIPS[tip]! : (hint ?? CAPTURE_TIPS[0]);

  return (
    <View style={{ flex: 1, backgroundColor: g.surround }}>
      {/* Light status-bar icons on the dark surround in both themes; the root SystemChrome style returns on unmount. */}
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
        <View style={{ minHeight: theme.components.appBar.minHeight, flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.space[1], gap: theme.space[2] }}>
          <IconButton icon="chevron-left" accessibilityLabel="Back" onPress={onCancel} color={media} />
          <View style={{ flex: 1 }} />
          {variant === 'tryon' ? <Tag label="Preview, not a shade guarantee" /> : null}
          <View style={{ width: theme.space[3] }} />
        </View>
        <View
          onLayout={onLayout}
          style={{ flex: 1, marginHorizontal: theme.space[3], borderRadius: g.frameRadius, overflow: 'hidden', backgroundColor: g.surround }}
        >
          <CameraView
            ref={camera}
            style={StyleSheet.absoluteFill}
            facing={facing}
            mode="picture"
            pictureSize={pictureSize}
            animateShutter={!reduced}
            onCameraReady={() => void onReady()}
            onMountError={onMountError}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          {size ? <FrameOverlay width={size.width} height={size.height} /> : null}
          <View style={{ position: 'absolute', top: theme.space[5], left: 0, right: 0, alignItems: 'center' }} pointerEvents="none">
            <View
              accessible
              accessibilityLiveRegion="polite"
              accessibilityLabel={message}
              style={{
                minHeight: g.hint.visualMinHeight,
                paddingHorizontal: g.hint.paddingX,
                borderRadius: g.hint.radius,
                backgroundColor: g.hint.bg,
                justifyContent: 'center',
                marginHorizontal: g.hint.insetX,
              }}
            >
              <Text {...theme.textProps.label} style={[g.hint.type, { color: g.hint.fg, textAlign: 'center' }]}>
                {message}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingVertical: theme.space[5] }}>
          <IconButton
            icon="info"
            variant="overlay"
            accessibilityLabel="Next photo tip"
            onPress={() => setTip((i) => ((i ?? -1) + 1) % TIPS.length)}
          />
          <Pressable
            onPress={() => void shoot()}
            disabled={!ready || capturing}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
            accessibilityState={{ disabled: !ready || capturing, busy: capturing }}
            style={{
              width: g.shutter.size,
              height: g.shutter.size,
              borderRadius: theme.radius.full,
              borderWidth: g.shutter.ringWidth,
              borderColor: g.shutter.ring,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: ready ? 1 : 0.5,
            }}
          >
            <View
              style={{
                width: g.shutter.size - g.shutter.ringWidth * 4,
                height: g.shutter.size - g.shutter.ringWidth * 4,
                borderRadius: theme.radius.full,
                backgroundColor: g.shutter.fill,
                transform: [{ scale: capturing && !reduced ? 0.9 : 1 }],
              }}
            />
          </Pressable>
          <IconButton
            icon="flip"
            variant="overlay"
            accessibilityLabel={facing === 'front' ? 'Switch to back camera' : 'Switch to front camera'}
            onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
