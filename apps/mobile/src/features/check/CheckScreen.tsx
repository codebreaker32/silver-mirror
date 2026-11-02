import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEMO_KEY, type HowThisWasMade, type Store } from '@skinkey/contracts';
import { FACET_MAP, medicineGate, rank, verdict } from '@skinkey/rules';
import { useTheme } from '@/theme/ThemeProvider';
import { glyphFromKey, loadScanLedger, useKey, ZoneGlyph } from '@/features/key';
import { BetterMatches, guessCategory, useBetterMatches } from '@/features/matches';
import { openStoreUrl } from '@/features/matches/openStoreUrl';
import { CropStep, inputFromPaste, sampleInput, takeShare, type CheckInput } from '@/features/share';
import { demo } from '@/demo';
import { workerCheckApi } from './api';
import { HowThisWasMadeSheet } from './components/HowThisWasMadeSheet';
import { LabelCamera } from './components/LabelCamera';
import { HeadSkeleton, ProductHeader } from './components/ProductHeader';
import { SkuConfirmSheet } from './components/SkuConfirmSheet';
import { UnknownPanel } from './components/UnknownPanel';
import { VerdictSheet } from './components/VerdictSheet';
import { productLine, tryonEntry, type Engine } from './flow';
import { contextClick } from './haptics';
import { documentScannerAvailable, scanLabel } from './media';
import { litZones, presentVerdict } from './present';
import { Body, Button, Icon, Tag } from './ui';
import { useCheckFlow } from './useCheckFlow';

const ENGINE: Engine = { verdict, medicineGate };
/** Web `?demo=` only: offline catalogue answers for screenshots. Always the Worker on native. */
const API = demo?.checkApi ?? workerCheckApi;

type Origin = 'share' | 'paste' | 'sample' | 'screenshot';

const STORE_NAME: Record<Store, string | null> = { flipkart: 'Flipkart', amazon_in: 'Amazon', nykaa: 'Nykaa', other: null };

function sourceLine(origin: Origin | null, store: Store): string {
  if (origin === 'sample') return 'Sample share';
  if (origin === 'paste') return 'Pasted link';
  if (origin === 'screenshot') return 'Shared screenshot';
  const name = STORE_NAME[store];
  return name ? `Shared from ${name}` : 'Shared link';
}

export default function CheckScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string; sample?: string; share?: string }>();
  const { key: storedKey, isDemo, loading: keyLoading, useDemo: chooseDemo } = useKey();
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [listingUrl, setListingUrl] = useState<string | null>(null);
  const [howOpen, setHowOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const key = storedKey ?? (origin === 'sample' ? DEMO_KEY : null);
  const usingDemo = isDemo || (!storedKey && origin === 'sample');
  const flow = useCheckFlow(API, ENGINE, key);
  const [scanLedger, setScanLedger] = useState<HowThisWasMade | null>(null);
  useEffect(() => {
    if (storedKey?.source !== 'youcam_hd') return;
    loadScanLedger()
      .then(setScanLedger)
      .catch(() => undefined);
  }, [storedKey?.source, storedKey?.scanId]);
  const { state, start, reset } = flow;

  const begin = useCallback(
    (input: CheckInput, from: Origin) => {
      // Each new input is a fresh check: drop the previous result, sheets and listing link.
      reset();
      setHowOpen(false);
      setCameraOpen(false);
      setOrigin(input.kind === 'image' ? 'screenshot' : from);
      setListingUrl(input.kind === 'text' ? input.parsed.url : null);
      start(input);
    },
    [start, reset],
  );

  // Shares (cold or warm start) arrive as /check?share=<id> from the root ShareRouter.
  const started = useRef<string | null>(null);
  useEffect(() => {
    if (keyLoading) return;
    const tag = params.share ? `share:${params.share}` : params.sample ? 'sample' : params.q ? `q:${params.q}` : null;
    if (!tag || started.current === tag) return;
    started.current = tag;
    if (params.share) {
      const input = takeShare(params.share);
      if (input) begin(input, 'share');
    } else if (params.sample) begin(sampleInput(), 'sample');
    else if (params.q) {
      const input = inputFromPaste(params.q);
      if (input) begin(input, 'paste');
    }
  }, [params.share, params.sample, params.q, keyLoading, begin]);

  const result = state.phase === 'result' ? state.result : null;
  const view = useMemo(
    () =>
      result
        ? presentVerdict(result.verdict, { key, product: result.product, catalogCount: result.catalogCount, labelTokenCount: result.labelTokenCount })
        : null,
    [result, key],
  );

  const landed = view ? `${view.label}|${result?.morphed ? 'm' : ''}|${result?.product?.id ?? ''}` : null;
  useEffect(() => {
    if (!landed || !view) return;
    void contextClick();
    AccessibilityInfo.announceForAccessibility(view.announce);
  }, [landed]); // eslint-disable-line react-hooks/exhaustive-deps

  const category = result?.product?.category ?? guessCategory(result?.title ?? null);
  const matches = useBetterMatches({
    api: API,
    rank,
    key,
    category,
    title: result?.title ?? null,
    excludeId: result?.product?.id,
    enabled: !!view?.showMatches,
  });

  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const sheetY = useRef(0);
  const matchesY = useRef(0);
  const toMatches = () => scroll.current?.scrollTo({ y: sheetY.current + matchesY.current, animated: true });

  const store = state.phase === 'resolving' ? state.store : (result?.store ?? (state.phase === 'confirm' ? state.resolve.store : 'other'));
  const storeName = STORE_NAME[store];
  const backToProduct = () => {
    if (listingUrl && storeName) void openStoreUrl(listingUrl).catch(() => router.back());
    else if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  const backDestination = listingUrl && storeName ? `Returns to the ${storeName} listing` : undefined;

  const snap = async () => {
    if (!documentScannerAvailable()) {
      setCameraOpen(true);
      return;
    }
    try {
      const b64 = await scanLabel();
      if (b64) flow.readLabel(b64);
    } catch {
      setCameraOpen(true);
    }
  };

  const tryon = result && view && view.label !== 'MEDICINE' ? tryonEntry(result.product) : null;
  const header =
    result?.product != null
      ? productLine(result.product)
      : (result?.title ?? (state.phase === 'resolving' ? state.title : state.phase === 'loading' ? productLine(state.candidate.product) : null));

  const actionBar =
    view && result ? (
      <View
        style={{
          ...t.components.actionBar.shadow,
          backgroundColor: t.components.actionBar.bg,
          borderTopWidth: 1,
          borderTopColor: t.components.actionBar.border,
          paddingTop: t.components.actionBar.paddingTop,
          paddingHorizontal: t.components.actionBar.paddingX,
          paddingBottom: insets.bottom + t.components.actionBar.paddingBottom,
          gap: t.components.actionBar.gap,
        }}
      >
        {view.label === 'MEDICINE' ? (
          <Button label="Back to product" onPress={backToProduct} destination={backDestination} testID="back-to-product" />
        ) : view.label === 'FITS' ? (
          <>
            <Button label="Back to product" onPress={backToProduct} destination={backDestination} testID="back-to-product" />
            <Button label="Find better matches" variant="secondary" onPress={toMatches} />
          </>
        ) : (
          <>
            <Button label="Find better matches" onPress={toMatches} testID="find-better" />
            <Button label="Back to product" variant="secondary" onPress={backToProduct} destination={backDestination} />
          </>
        )}
      </View>
    ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <View
        style={{
          paddingTop: insets.top,
          minHeight: t.components.appBar.minHeight + insets.top,
          paddingHorizontal: t.components.appBar.paddingX,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: t.components.appBar.bg,
        }}
      >
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={{
            width: t.components.iconButton.target,
            height: t.components.iconButton.target,
            borderRadius: t.components.iconButton.radius,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="back" size={t.components.appBar.iconSize} color={t.components.appBar.fg} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2], flex: 1 }}>
          <Icon name="share" size={t.icon.sm} color={t.components.appBar.sourceColor} />
          <Text accessibilityRole="header" style={[t.components.appBar.source, { color: t.components.appBar.sourceColor }]}>
            {state.phase === 'idle' ? 'Check a product' : sourceLine(origin, store)}
          </Text>
        </View>
      </View>

      {state.phase === 'crop' ? (
        <CropStep
          uri={state.image.uri}
          width={state.image.width}
          height={state.image.height}
          onCropped={flow.sendCrop}
          onCancel={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      ) : (
        <ScrollView
          ref={scroll}
          contentContainerStyle={{ paddingHorizontal: t.spacing.gutter, paddingTop: t.space[2], paddingBottom: t.space[10], gap: t.space[6] }}
        >
          {state.phase !== 'idle' && state.phase !== 'error' && state.phase !== 'not_skincare' ? (
            <ProductHeader title={header} meta={result?.product ? null : origin === 'sample' ? 'Sample listing' : null} />
          ) : null}

          {usingDemo && (state.phase === 'result' || state.phase === 'confirm') ? (
            <Tag label="Demo Key: labelled sample readings" variant="neutral" />
          ) : null}

          {state.phase === 'resolving' ? <HeadSkeleton label="Reading the shared link…" /> : null}
          {state.phase === 'confirm' ? <HeadSkeleton label="Confirm the product to see the check." /> : null}
          {state.phase === 'loading' ? <HeadSkeleton label="Checking this product…" /> : null}

          {view && result ? (
            <>
              {!key && view.label !== 'MEDICINE' ? (
                <View style={{ gap: t.space[2] }} testID="no-key">
                  <Body>Scan for reasons based on your readings.</Body>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space[2] }}>
                    <Button label="Start scan" variant="tertiary" onPress={() => router.push('/scan')} />
                    <Button label="Use the Demo Key" variant="tertiary" onPress={chooseDemo} />
                  </View>
                </View>
              ) : null}
              <View onLayout={(e) => (sheetY.current = e.nativeEvent.layout.y)}>
              <VerdictSheet
                view={view}
                onHowMade={() => setHowOpen(true)}
                glyph={
                  key && litZones(result.verdict).length ? (
                    <View style={{ alignItems: 'center' }}>
                      <ZoneGlyph model={glyphFromKey(key)} highlight={litZones(result.verdict)} width={160} showLegend={false} />
                    </View>
                  ) : null
                }
                unknown={
                  <UnknownPanel
                    catalogCount={result.catalogCount}
                    label={result.label}
                    onSnap={() => void snap()}
                    onChips={flow.setChips}
                    onRun={flow.runLabel}
                  />
                }
                tryon={
                  tryon && result.product ? (
                    <Button
                      label={tryon.label}
                      variant="secondary"
                      testID="tryon-entry"
                      accessibilityHint="Asks for a separate selfie consent first."
                      onPress={() => router.push({ pathname: '/tryon', params: { productId: result.product!.id, mode: tryon.mode, productName: productLine(result.product!) } })}
                    />
                  ) : null
                }
                matches={
                  <View onLayout={(e) => (matchesY.current = e.nativeEvent.layout.y)}>
                    <BetterMatches state={matches} keyProfile={key} category={category} facetMap={FACET_MAP} />
                  </View>
                }
              />
              </View>
            </>
          ) : null}

          {state.phase === 'not_skincare' ? (
            <View style={{ gap: t.space[4] }}>
              <Text accessibilityRole="header" style={[t.type.headline, { color: t.colors.text }]}>
                This doesn't look like a skincare listing
              </Text>
              <Body muted>SkinKey checks face and lip products. Try another product, or the sample share on Home.</Body>
              <Button label="Back" variant="secondary" onPress={() => router.back()} />
            </View>
          ) : null}

          {state.phase === 'error' ? (
            <View style={{ gap: t.space[4] }}>
              <Text accessibilityRole="header" style={[t.type.headline, { color: t.colors.text }]}>
                Something went wrong
              </Text>
              <Body muted accessibilityLiveRegion="polite">
                {state.message}
              </Body>
              <Button label="Try again" onPress={flow.retry} />
              <Button label="Back" variant="tertiary" onPress={() => router.back()} />
            </View>
          ) : null}

          {state.phase === 'idle' ? (
            <View style={{ gap: t.space[4] }}>
              <Text accessibilityRole="header" style={[t.type.headline, { color: t.colors.text }]}>
                Nothing to check yet
              </Text>
              <Body muted>In Flipkart or Amazon.in, tap Share → SkinKey. Or paste a link on Home.</Body>
              <Button label="Go to Home" variant="secondary" onPress={() => router.replace('/')} />
            </View>
          ) : null}
        </ScrollView>
      )}

      {actionBar}

      {state.phase === 'confirm' ? (
        <SkuConfirmSheet
          visible
          mode={state.mode}
          candidates={state.candidates}
          onConfirm={(c) => void flow.confirm(c)}
          onNotThis={flow.notThis}
          onClose={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      ) : null}

      {result && view ? (
        <HowThisWasMadeSheet visible={howOpen} onClose={() => setHowOpen(false)} ledgers={scanLedger ? [scanLedger, ...result.ledgers] : result.ledgers} rulesetHash={result.verdict.provenance.rulesetHash} />
      ) : null}

      <LabelCamera visible={cameraOpen} onClose={() => setCameraOpen(false)} onPhoto={flow.readLabel} />
    </View>
  );
}
