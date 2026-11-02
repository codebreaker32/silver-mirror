import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, ImageBackground, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { COPY } from '@skinkey/contracts';
import { Button, EmptyState, Icon, Screen, Segmented, Sheet, TextLink } from '@/components';
import { ProductArt } from '@/components/ProductArt';
import { useToast } from '@/components/Toast';
import { useReduceMotion } from '@/components/useReduceMotion';
import { homeType } from '@/components/home/homeType';
import { useKey } from '@/features/key';
import { useSaved } from '@/features/saved';
import { useTheme } from '@/theme/ThemeProvider';
import type { FilledStep, RoutineProduct, RoutineTime } from './model';
import { RowPressable } from './PressableScale';
import { useRoutine } from './useRoutine';

const BACKDROP = require('../../../assets/images/welcome-backdrop.jpg');

const SEGMENTS = ['AM Routine', 'PM Routine'] as const;
type Segment = (typeof SEGMENTS)[number];
const TIME: Record<Segment, RoutineTime> = { 'AM Routine': 'am', 'PM Routine': 'pm' };

const PLATE = 56;
const RAIL = 20;
const DOT = 10;
const STAGGER_MS = 40;

/**
 * Your Routine (experience reference, 5th phone). A serif title, the AM / PM segmented control, then a vertical
 * timeline: a dot and a line on the left, one surface-tone row per step with the product plate, the step name and the
 * catalogue product that fits the reading. Tapping a row opens the check for that product; "Change" opens a sheet of
 * other fitting products in the same category. A quiet "Stay consistent" banner over the liquid-silver photo closes it.
 * Cosmetic and honest: no toner step (no toner shelf), no promise of results, no numbers.
 */
export function RoutineScreen() {
  const t = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { key, isDemo, loading, useDemo } = useKey();
  const { saved } = useSaved();
  const savedIds = useMemo(() => new Set(saved), [saved]);
  const { state, swap, retry } = useRoutine(key, savedIds);
  const [segment, setSegment] = useState<Segment>('AM Routine');
  const [changing, setChanging] = useState<FilledStep | null>(null);
  const time = TIME[segment];

  const title = (
    <Text accessibilityRole="header" style={[homeType.greeting, { color: t.colors.text }]}>
      Your Routine
    </Text>
  );

  if (loading) return <Screen appBar={false}>{title}</Screen>;

  if (!key) {
    return (
      <Screen appBar={false} testID="routine-screen">
        {title}
        <EmptyState
          testID="routine-empty"
          plate="face"
          title="Your routine starts with your reading"
          body="Each step is filled with a product from our catalogue that fits your reading. Scan once, about a minute, or try the Demo reading."
        >
          <Button label="Start scan" trailingIcon="arrow-right" onPress={() => router.push('/scan')} />
          <Button label={COPY.reading.useDemo} variant="secondary" onPress={useDemo} />
        </EmptyState>
      </Screen>
    );
  }

  const steps = state.status === 'ready' ? state.steps[time] : null;

  const open = (p: RoutineProduct) => router.push({ pathname: '/check', params: { q: p.query } });

  const choose = (p: RoutineProduct) => {
    if (!changing) return;
    if (p.productId !== changing.product?.productId) {
      swap(time, changing.category, p.productId);
      toast.show('Routine updated');
    }
    setChanging(null);
  };

  return (
    <Screen appBar={false} testID="routine-screen">
      <View style={{ gap: t.space[2] }}>
        {title}
        <Text style={[homeType.body, { color: t.colors.textMuted }]}>
          {isDemo ? `Built from the ${COPY.reading.demo}.` : 'Built from your reading.'} Every step is a catalogue product that fits it.
        </Text>
      </View>

      <View style={{ marginTop: t.space[5] }}>
        <Segmented options={SEGMENTS} value={segment} onChange={setSegment} accessibilityLabel="Routine" testID="routine-time" />
      </View>

      <View style={{ marginTop: t.space[5] }}>
        {state.status === 'error' ? (
          <EmptyState testID="routine-error" plate={{ icon: 'cloud-off' }} title="Couldn't load the catalogue" body="Check your connection, then try again.">
            <Button label="Try again" variant="secondary" onPress={retry} testID="routine-retry" />
          </EmptyState>
        ) : steps ? (
          <Timeline key={time} steps={steps} time={time} onOpen={open} onChange={setChanging} />
        ) : (
          <SkeletonTimeline count={time === 'am' ? 4 : 3} />
        )}
      </View>

      <ConsistentBanner />

      <Sheet
        visible={!!changing}
        title={changing ? `Change ${changing.label.toLowerCase()}` : ''}
        supporting="Other products in our catalogue that fit your reading."
        onClose={() => setChanging(null)}
        testID="routine-change-sheet"
      >
        {changing ? (
          <View style={{ gap: t.space[2], paddingTop: t.space[3] }}>
            {[changing.product, ...changing.alternatives]
              .filter((p): p is RoutineProduct => !!p)
              .map((p, i) => (
                <SwapRow key={p.productId} product={p} current={p.productId === changing.product?.productId} onPress={() => choose(p)} testID={`routine-swap-${i}`} />
              ))}
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}

/** Rows fade and rise in once per screen, 40ms apart; reduced motion shows them at rest. */
let playedOnce = false;

function Timeline({
  steps,
  time,
  onOpen,
  onChange,
}: {
  steps: readonly FilledStep[];
  time: RoutineTime;
  onOpen: (p: RoutineProduct) => void;
  onChange: (s: FilledStep) => void;
}) {
  const t = useTheme();
  const reduced = useReduceMotion();
  const play = !playedOnce && !reduced;
  const progress = useRef(steps.map(() => new Animated.Value(play ? 0 : 1))).current;

  useEffect(() => {
    if (!play) return;
    playedOnce = true;
    Animated.stagger(
      STAGGER_MS,
      progress.map((v) => Animated.timing(v, { toValue: 1, duration: 260, easing: Easing.out(Easing.exp), useNativeDriver: true })),
    ).start();
    // Plays once, on the first ready render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View testID={`routine-steps-${time}`} accessibilityLabel={`${time === 'am' ? 'Morning' : 'Evening'} routine, ${steps.length} steps`}>
      {steps.map((s, i) => {
        const v = progress[i] ?? new Animated.Value(1);
        const last = i === steps.length - 1;
        return (
          <Animated.View
            key={s.category}
            style={{ flexDirection: 'row', opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}
          >
            <Rail first={i === 0} last={last} />
            <View style={{ flex: 1, paddingBottom: last ? 0 : t.space[3] }}>
              <StepRow step={s} index={i} total={steps.length} onOpen={onOpen} onChange={onChange} />
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

/** The timeline rail beside one row: the line runs through the dot and on through the gap to the next row. */
function Rail({ first, last }: { first: boolean; last: boolean }) {
  const t = useTheme();
  const line = (visible: boolean, flex?: number, height?: number) => (
    <View style={{ width: 2, flex, height, borderRadius: 1, backgroundColor: visible ? t.colors.borderStrong : 'transparent', opacity: 0.45 }} />
  );
  return (
    <View style={{ width: RAIL, marginRight: t.space[3], alignItems: 'center' }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {line(!first, 1)}
      <View style={{ width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: t.colors.accent }} />
      {line(!last, 1)}
      {last ? null : line(true, undefined, t.space[3])}
    </View>
  );
}

function StepRow({
  step,
  index,
  total,
  onOpen,
  onChange,
}: {
  step: FilledStep;
  index: number;
  total: number;
  onOpen: (p: RoutineProduct) => void;
  onChange: (s: FilledStep) => void;
}) {
  const t = useTheme();
  const p = step.product;
  const shell = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: t.space[3],
    minHeight: PLATE + t.space[3] * 2,
    padding: t.space[3],
    paddingRight: t.space[2],
    borderRadius: 16,
    backgroundColor: t.colors.surface,
  };

  if (!p) {
    return (
      <View style={shell} testID={`routine-step-${step.category}`} accessible accessibilityLabel={`Step ${index + 1} of ${total}, ${step.label}. Nothing in our catalogue fits your reading for this step yet.`}>
        <View style={{ width: PLATE, height: PLATE, borderRadius: 12, backgroundColor: t.colors.bgSunken }} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[homeType.bodyStrong, { fontFamily: homeType.smallStrong.fontFamily, color: t.colors.text }]}>{step.label}</Text>
          <Text style={[homeType.small, { color: t.colors.textMuted }]}>Nothing in our catalogue fits your reading for this step yet.</Text>
        </View>
      </View>
    );
  }

  return (
    <RowPressable
      testID={`routine-step-${step.category}`}
      onPress={() => onOpen(p)}
      accessibilityRole="button"
      accessibilityLabel={`Step ${index + 1} of ${total}, ${step.label}: ${p.brand} ${p.name}. Fits your reading. ${p.reason}.`}
      accessibilityHint="Opens a check for this product"
      style={shell}
    >
      <ProductArt category={step.category} size={PLATE} style={{ borderRadius: 12 }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={[homeType.bodyStrong, { fontFamily: homeType.smallStrong.fontFamily, color: t.colors.text }]}>
          {step.label}
        </Text>
        <Text numberOfLines={2} style={[homeType.small, { color: t.colors.textMuted }]}>
          {p.brand} {p.name}
        </Text>
      </View>
      {step.alternatives.length ? (
        <TextLink label="Change" accessibilityLabel={`Change ${step.label.toLowerCase()}`} onPress={() => onChange(step)} testID={`routine-change-${step.category}`} />
      ) : null}
    </RowPressable>
  );
}

function SwapRow({ product, current, onPress, testID }: { product: RoutineProduct; current: boolean; onPress: () => void; testID?: string }) {
  const t = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: current }}
      accessibilityLabel={`${product.brand} ${product.name}. ${product.reason}.${current ? ' In your routine.' : ''}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[3],
        minHeight: t.touch.min,
        padding: t.space[3],
        borderRadius: 16,
        backgroundColor: pressed ? t.colors.bgSunken : t.colors.surface,
      })}
    >
      <ProductArt category={product.category} size={44} style={{ borderRadius: 12 }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={2} style={[homeType.bodyStrong, { color: t.colors.text }]}>
          {product.brand} {product.name}
        </Text>
        <Text numberOfLines={1} style={[homeType.small, { color: t.colors.textMuted }]}>
          {product.reason}
        </Text>
      </View>
      {current ? <Icon name="check" size={t.icon.sm} color={t.colors.text} strokeWidth={2} /> : null}
    </Pressable>
  );
}

/** Rows in the timeline shape at the well tone while the catalogue loads. Static: nothing pulses. */
function SkeletonTimeline({ count }: { count: number }) {
  const t = useTheme();
  return (
    <View testID="routine-loading" accessible accessibilityLabel="Loading your routine" style={{ gap: t.space[3] }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: RAIL, marginRight: t.space[3], alignItems: 'center' }}>
            <View style={{ width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: t.colors.bgSunken }} />
          </View>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: t.space[3], padding: t.space[3], borderRadius: 16, backgroundColor: t.colors.surface }}>
            <View style={{ width: PLATE, height: PLATE, borderRadius: 12, backgroundColor: t.colors.bgSunken }} />
            <View style={{ flex: 1, gap: t.space[2] }}>
              <View style={{ width: '40%', height: 14, borderRadius: 7, backgroundColor: t.colors.bgSunken }} />
              <View style={{ width: '75%', height: 12, borderRadius: 6, backgroundColor: t.colors.bgSunken }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Closing banner over a crop of the liquid-silver photo: one serif line and one honest muted line. */
function ConsistentBanner() {
  const t = useTheme();
  return (
    <ImageBackground
      source={BACKDROP}
      resizeMode="cover"
      testID="routine-banner"
      accessible
      accessibilityLabel="Stay consistent. Same steps, morning and night. Check new products before you add them."
      style={{ marginTop: t.space[6], minHeight: 132, borderRadius: 16, overflow: 'hidden', justifyContent: 'flex-end' }}
      imageStyle={{ borderRadius: 16 }}
    >
      <View style={{ padding: t.space[4], gap: t.space[1], backgroundColor: t.colors.secondaryTranslucent }}>
        <Text style={{ fontFamily: homeType.greeting.fontFamily, fontSize: 22, lineHeight: 28, color: t.colors.text, includeFontPadding: false }}>
          Stay consistent
        </Text>
        <Text style={[homeType.small, { color: t.colors.textMuted }]}>Same steps, morning and night. Check new products before you add them.</Text>
      </View>
    </ImageBackground>
  );
}
