import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COPY, DEMO_KEY, type HowThisWasMade, type Store } from '@skinkey/contracts';
import { FACET_MAP, medicineGate, rank, verdict } from '@skinkey/rules';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, Card, EmptyState, Icon, IconButton, IconDisc, PillButton, Tag, Txt, type IconName } from '@/components';
import { glyphFromKey, loadScanLedger, useKey, ZoneGlyph } from '@/features/key';
import { BetterMatches, guessCategory, storeLinks, StoreSearchSheet, useBetterMatches } from '@/features/matches';
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
import { shortListingTitle, sizeMeta } from './display';
import { productLine, tryonEntry, type Engine } from './flow';
import { contextClick } from './haptics';
import { documentScannerAvailable, scanLabel } from './media';
import { litZones, presentVerdict } from './present';
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

const SOURCE_ICON: Record<Origin, IconName> = { share: 'arrow-down-left', screenshot: 'arrow-down-left', paste: 'paste', sample: 'tag-check' };

/** App bar (component.appBar): one chevron-left back button and the store source as a small sunken chip. */
function CheckAppBar({ label, icon, onBack }: { label: string; icon: IconName | null; onBack: () => void }) {
  const t = useTheme();
  const a = t.components.appBar;
  const h = t.components.productHeader;
  return (
    <View style={{ minHeight: a.minHeight, paddingHorizontal: a.paddingX, flexDirection: 'row', alignItems: 'center', gap: t.space[1], backgroundColor: a.bg }}>
      <IconButton icon="chevron-left" accessibilityLabel="Back" onPress={onBack} color={a.fg} />
      {icon ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.space[1] + 2,
            paddingHorizontal: t.space[3],
            minHeight: t.components.tag.visualMinHeight + t.space[2],
            borderRadius: t.radius.full,
            backgroundColor: h.sourceChipBg,
          }}
        >
          <Icon name={icon} size={t.icon.sm} color={h.sourceChipFg} />
          <Txt accessibilityRole="header" variant="label" numberOfLines={1} style={{ color: h.sourceChipFg }}>
            {label}
          </Txt>
        </View>
      ) : (
        <Txt accessibilityRole="header" variant="headline" numberOfLines={1} style={[a.title, { color: a.fg }]}>
          {label}
        </Txt>
      )}
    </View>
  );
}

/** Compact "No reading yet" card, always under the verdict (DESIGN.md §9.4). */
function NoReadingCard({ onScan, onDemo, primary }: { onScan: () => void; onDemo: () => void; primary: boolean }) {
  const t = useTheme();
  return (
    <Card variant="raised" testID="no-key" gap={t.space[4]}>
      <View style={{ flexDirection: 'row', gap: t.space[3], alignItems: 'flex-start' }}>
        <IconDisc icon="face-frame" />
        <View style={{ flex: 1, gap: t.space[1] }}>
          <Txt accessibilityRole="header" variant="section">
            {COPY.reading.none}
          </Txt>
          <Body small muted>
            Scan for reasons based on your readings.
          </Body>
        </View>
      </View>
      <View style={{ gap: t.space[1] }}>
        <PillButton label="Start scan" variant={primary ? 'primary' : 'secondary'} leadingIcon="face-frame" onPress={onScan} />
        <PillButton label={COPY.reading.useDemo} variant="tertiary" trailingIcon="chevron-right" onPress={onDemo} style={{ alignSelf: 'center' }} />
      </View>
    </Card>
  );
}

/**
 * "Better matches" jump pill (DESIGN.md §8.7). It sits in the dock, above the primary row, only while that section is
 * off screen, so it never covers copy.
 */
function MatchesPill({ onPress }: { onPress: () => void }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Better matches"
        accessibilityHint="Scrolls to catalogue products ranked by fit to your readings."
        testID="find-better"
        style={{ minHeight: t.touch.min, justifyContent: 'center' }}
      >
        {({ pressed }) => (
          <View
            style={{
              borderRadius: t.radius.full,
              backgroundColor: pressed ? t.components.button.secondary.bgPressed : t.components.button.secondary.bg,
              minHeight: t.components.chip.visualMinHeight + t.space[1],
              paddingHorizontal: t.space[4],
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space[2],
            }}
          >
            <Txt variant="label">Better matches</Txt>
            <Icon name="chevron-down" size={t.icon.sm} color={t.colors.text} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

export default function CheckScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const params = useLocalSearchParams<{ q?: string; sample?: string; share?: string }>();
  const { key: storedKey, isDemo, loading: keyLoading, useDemo: chooseDemo } = useKey();
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [listingUrl, setListingUrl] = useState<string | null>(null);
  const [howOpen, setHowOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
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

  // Scroll geometry: the "Better matches" pill shows only while that section is off screen, and the dock edge only
  // while content scrolls under it (component.actionBar).
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const sheetY = useRef(0);
  const matchesY = useRef<number | null>(null);
  const geo = useRef({ y: 0, viewport: 0, content: 0 });
  const [matchesOnScreen, setMatchesOnScreen] = useState(false);
  const [under, setUnder] = useState(false);
  const measure = useCallback(() => {
    const { y, viewport, content } = geo.current;
    const top = matchesY.current == null ? null : sheetY.current + matchesY.current;
    setMatchesOnScreen(top != null && y + viewport > top + t.space[12]);
    setUnder(content - (y + viewport) > 1);
  }, [t.space]);

  const begin = useCallback(
    (input: CheckInput, from: Origin) => {
      // Each new input is a fresh check: drop the previous result, sheets and listing link.
      reset();
      // A share that replaces a scrolled check starts at the top. Android can clamp the offset without an onScroll,
      // so reset the remembered geometry too, or the "Better matches" pill stays hidden on the new page.
      scroll.current?.scrollTo({ y: 0, animated: false });
      geo.current.y = 0;
      matchesY.current = null;
      setMatchesOnScreen(false);
      setHowOpen(false);
      setMoreOpen(false);
      setCameraOpen(false);
      setOrigin(input.kind === 'image' ? 'screenshot' : from);
      // The sample listing's URL is not a real listing: never offer to go back to it.
      setListingUrl(input.kind === 'text' && from !== 'sample' ? input.parsed.url : null);
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
        ? presentVerdict(result.verdict, {
            key,
            product: result.product,
            catalogCount: result.catalogCount,
            labelTokenCount: result.labelTokenCount,
            listingTitle: result.product ? null : result.title,
          })
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
    store: result?.store ?? null,
    enabled: !!view?.showMatches,
  });
  const links = useMemo(() => storeLinks({ category, key, facetMap: FACET_MAP, facetLabel: COPY.flipkartFacetLink }), [category, key]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    geo.current.y = e.nativeEvent.contentOffset.y;
    measure();
  };
  const toMatches = () => {
    if (matchesY.current == null) return;
    scroll.current?.scrollTo({ y: Math.max(0, sheetY.current + matchesY.current - t.space[2]), animated: true });
  };

  const store = state.phase === 'resolving' ? state.store : (result?.store ?? (state.phase === 'confirm' ? state.resolve.store : 'other'));
  const storeName = STORE_NAME[store];
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const backToProduct = () => {
    if (listingUrl && storeName) void openStoreUrl(listingUrl).catch(() => router.back());
    else if (origin === 'sample') router.replace('/');
    else goBack();
  };
  const toListing = !!(listingUrl && storeName);
  const backLabel = toListing ? `Back to ${storeName} listing` : origin === 'sample' ? 'Back to home' : 'Back to product';
  const backDestination = toListing ? `Returns to the ${storeName} listing` : undefined;

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
  // Catalogue product: brand · name in the title, the pack size in the meta line (DESIGN.md §9.4). Raw listing titles
  // lose their SEO tail here; the ledger's Product row keeps the full text.
  const nameOnly = (p: { brand: string; name: string }) => productLine({ brand: p.brand, name: p.name });
  const rawTitle = result?.title ?? (state.phase === 'resolving' ? state.title : null);
  const header =
    result?.product != null
      ? nameOnly(result.product)
      : state.phase === 'loading'
        ? nameOnly(state.candidate.product)
        : rawTitle
          ? shortListingTitle(rawTitle)
          : null;
  const headerProduct = result?.product ?? (state.phase === 'loading' ? state.candidate.product : null);
  const headerMeta = headerProduct ? sizeMeta(headerProduct.size) : origin === 'sample' ? 'Sample listing' : null;

  const inlineDock = fontScale >= t.components.actionBar.inlineAtFontScale;
  const showMore = !!view && view.showMatches;
  const showPill = !!view && view.showMatches && !matchesOnScreen && !inlineDock;
  const dockActions =
    view && result ? (
      <View style={{ gap: t.space[1] }}>
      {showPill ? <MatchesPill onPress={toMatches} /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.components.actionBar.gap }}>
        <View style={{ flex: 1 }}>
          <PillButton
            label={backLabel}
            onPress={backToProduct}
            trailingIcon={toListing ? 'arrow-up-right' : undefined}
            accessibilityHint={backDestination}
            testID="back-to-product"
          />
        </View>
        {showMore ? <IconButton icon="more-horizontal" variant="tonal" accessibilityLabel="More: search the stores" onPress={() => setMoreOpen(true)} testID="dock-more" /> : null}
      </View>
      </View>
    ) : null;

  const dock =
    dockActions && !inlineDock ? (
      <View
        style={{
          ...(under && !t.dark ? t.components.actionBar.shadow : null),
          backgroundColor: t.components.actionBar.bg,
          borderTopWidth: 1,
          borderTopColor: under ? (t.dark ? t.colors.sheenEdge : t.components.actionBar.border) : 'transparent',
          paddingTop: t.components.actionBar.paddingTop,
          paddingHorizontal: t.components.actionBar.paddingX,
          paddingBottom: insets.bottom + t.components.actionBar.paddingBottom + t.space[1],
        }}
      >
        {dockActions}
      </View>
    ) : null;

  const medicine = view?.label === 'MEDICINE';

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg, paddingTop: insets.top }}>
      <CheckAppBar
        label={state.phase === 'idle' ? 'Check a product' : sourceLine(origin, store)}
        icon={state.phase === 'idle' || !origin ? null : SOURCE_ICON[origin]}
        onBack={goBack}
      />

      {state.phase === 'crop' ? (
        <CropStep uri={state.image.uri} width={state.image.width} height={state.image.height} onCropped={flow.sendCrop} onCancel={goBack} />
      ) : (
        <ScrollView
          ref={scroll}
          onScroll={onScroll}
          scrollEventThrottle={64}
          onLayout={(e) => {
            geo.current.viewport = e.nativeEvent.layout.height;
            measure();
          }}
          onContentSizeChange={(_w, h) => {
            geo.current.content = h;
            measure();
          }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: t.spacing.gutter,
            paddingTop: t.space[2],
            paddingBottom: inlineDock ? insets.bottom + t.space[6] : t.space[10],
            gap: t.spacing.stackLg,
          }}
        >
          {state.phase !== 'idle' && state.phase !== 'error' && state.phase !== 'not_skincare' ? (
            <ProductHeader title={header} meta={headerMeta} />
          ) : null}

          {usingDemo && state.phase === 'confirm' ? <Tag label={`${COPY.reading.demo}: labelled sample readings`} variant="demo" /> : null}

          {state.phase === 'resolving' ? <HeadSkeleton label="Reading the shared link…" /> : null}
          {state.phase === 'confirm' ? <HeadSkeleton label="Confirm the product to see the check." /> : null}
          {state.phase === 'loading' ? <HeadSkeleton label="Checking this product…" /> : null}

          {view && result ? (
            <View
              style={medicine ? { paddingTop: t.space[10] } : undefined}
              onLayout={(e) => {
                sheetY.current = e.nativeEvent.layout.y;
                measure();
              }}
            >
              <VerdictSheet
                view={view}
                demo={usingDemo}
                onHowMade={() => setHowOpen(true)}
                afterHead={
                  !key && !medicine ? (
                    <NoReadingCard onScan={() => router.push('/scan')} onDemo={chooseDemo} primary={view.unknownKind !== 'ingredients'} />
                  ) : null
                }
                glyph={
                  key && litZones(result.verdict).length ? (
                    <ZoneGlyph model={glyphFromKey(key)} highlight={litZones(result.verdict)} width={160} showLegend={false} />
                  ) : null
                }
                unknown={<UnknownPanel catalogCount={result.catalogCount} label={result.label} onSnap={() => void snap()} onChips={flow.setChips} onRun={flow.runLabel} />}
                tryon={
                  tryon && result.product ? (
                    <PillButton
                      label={tryon.label}
                      variant="secondary"
                      leadingIcon="face-frame"
                      testID="tryon-entry"
                      accessibilityHint="Asks for a separate selfie consent first."
                      onPress={() =>
                        router.push({
                          pathname: '/tryon',
                          params: { productId: result.product!.id, mode: tryon.mode, productName: nameOnly(result.product!), productSize: sizeMeta(result.product!.size) ?? '' },
                        })
                      }
                    />
                  ) : null
                }
                matches={
                  <View
                    onLayout={(e) => {
                      matchesY.current = e.nativeEvent.layout.y;
                      measure();
                    }}
                  >
                    <BetterMatches state={matches} keyProfile={key} category={category} facetMap={FACET_MAP} />
                  </View>
                }
              />
            </View>
          ) : null}

          {state.phase === 'not_skincare' ? (
            <EmptyState
              plate={{ icon: 'tag-check' }}
              title="This doesn't look like a skincare listing"
              body={`${COPY.appName} checks face and lip products. Try another product, or the sample share on Home.`}
            >
              <PillButton label="Back" onPress={goBack} />
            </EmptyState>
          ) : null}

          {state.phase === 'error' ? (
            <EmptyState plate={{ icon: 'cloud-off' }} title="Something went wrong">
              <Body muted accessibilityLiveRegion="polite">
                {state.message}
              </Body>
              <PillButton label="Try again" onPress={flow.retry} />
              <PillButton label="Back" variant="tertiary" onPress={goBack} style={{ alignSelf: 'center' }} />
            </EmptyState>
          ) : null}

          {state.phase === 'idle' ? (
            <EmptyState plate="mark" title="Nothing to check yet" body={COPY.shareTo}>
              <PillButton label="Paste a link" leadingIcon="paste" onPress={() => router.replace('/')} />
            </EmptyState>
          ) : null}

          {inlineDock && dockActions ? <View style={{ paddingTop: t.space[2] }}>{dockActions}</View> : null}
        </ScrollView>
      )}

      {dock}

      {state.phase === 'confirm' ? (
        <SkuConfirmSheet
          visible
          mode={state.mode}
          candidates={state.candidates}
          sharedTitle={state.resolve.extractedTitle}
          onConfirm={(c) => void flow.confirm(c)}
          onNotThis={flow.notThis}
          onClose={goBack}
        />
      ) : null}

      {result && view ? (
        <HowThisWasMadeSheet
          visible={howOpen}
          onClose={() => setHowOpen(false)}
          ledgers={scanLedger ? [scanLedger, ...result.ledgers] : result.ledgers}
          rulesetHash={result.verdict.provenance.rulesetHash}
        />
      ) : null}

      {showMore ? <StoreSearchSheet visible={moreOpen} onClose={() => setMoreOpen(false)} links={links} /> : null}

      <LabelCamera visible={cameraOpen} onClose={() => setCameraOpen(false)} onPhoto={flow.readLabel} />
    </View>
  );
}
