import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { CAPTURE_TIPS, LIGHT_HINT } from './captureHints';
import { deleteLocal } from './native';
import { pickPictureSize } from './pictureSize';
import { Button, Icon, Screen, StateView, Tag, haptic, useReduceMotion } from './ui';

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

function OvalMask({ width, height }: { width: number; height: number }) {
  const theme = useTheme();
  const g = theme.components.captureGuide;
  const rx = (width * g.ovalWidthPct) / 100 / 2;
  const ry = rx / g.ovalAspect;
  const cx = width / 2;
  const cy = height * 0.45;
  const d = `M0 0H${width}V${height}H0Z M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path d={d} fill={g.overlay} fillRule="evenodd" />
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke={g.oval} strokeWidth={g.ovalStrokeWidth} fill="none" />
    </Svg>
  );
}

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
      <Screen title={variant === 'scan' ? 'Skin scan' : 'Try-on photo'} onBack={onCancel}>
        <StateView title="Camera needed" body="SkinKey needs the camera to take one photo for YouCam to analyse.">
          <Button label="Open settings" onPress={() => void Linking.openSettings()} />
          <Button label="Not now" variant="tertiary" onPress={onCancel} />
        </StateView>
      </Screen>
    );
  }

  if (review) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, margin: theme.space[4], borderRadius: theme.radius.lg, overflow: 'hidden', backgroundColor: theme.colors.bgSunken }}>
          <Image
            source={{ uri: review.uri }}
            cachePolicy="none"
            contentFit="contain"
            style={{ flex: 1 }}
            accessibilityLabel="The photo you just took"
          />
        </View>
        <View style={{ padding: theme.space[5], gap: theme.space[3] }}>
          <Button label="Use photo" onPress={() => {
            const photo = review;
            reviewRef.current = null;
            setReview(null);
            onCaptured(photo);
          }} />
          <Button
            label="Retake"
            variant="secondary"
            onPress={() => {
              deleteLocal(review.uri);
              setReview(null);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const onLayout = (e: LayoutChangeEvent) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
  const message = hint ?? LIGHT_HINT;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.inverseSurface }} onLayout={onLayout}>
      <CameraView
        ref={camera}
        style={StyleSheet.absoluteFill}
        facing={facing}
        mode="picture"
        pictureSize={pictureSize}
        animateShutter={!reduced}
        onCameraReady={() => void onReady()}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      {size ? <OvalMask width={size.width} height={size.height} /> : null}
      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }} pointerEvents="box-none">
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.space[1] }}>
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={{ width: theme.touch.min, height: theme.touch.min, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="back" size={theme.icon.lg} color={media} />
          </Pressable>
          {variant === 'tryon' ? <Tag label="Preview, not a shade guarantee" /> : null}
        </View>
        <View style={{ paddingHorizontal: theme.spacing.gutter, gap: theme.space[1] }} accessibilityLiveRegion="polite">
          {hint ? null : CAPTURE_TIPS.map((tip) => (
            <Text key={tip} style={[theme.type.body, { color: media, textAlign: 'center' }]}>
              {tip}
            </Text>
          ))}
        </View>
        <View style={{ flex: 1 }} pointerEvents="none" />
        <View style={{ alignItems: 'center', gap: theme.space[5], paddingBottom: theme.space[6] }}>
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
              marginHorizontal: theme.spacing.gutter,
            }}
          >
            <Text style={[g.hint.type, { color: g.hint.fg, textAlign: 'center' }]}>{message}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.space[10] }}>
            <View style={{ width: theme.touch.min }} />
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
            <Pressable
              onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
              accessibilityRole="button"
              accessibilityLabel={facing === 'front' ? 'Switch to back camera' : 'Switch to front camera'}
              style={{ width: theme.touch.min, height: theme.touch.min, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="flip" size={theme.icon.lg} color={media} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
