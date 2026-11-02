import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COPY, DEMO_KEY, type HowThisWasMade, type Store } from '@skinkey/contracts';
import { FACET_MAP, medicineGate, rank, verdict } from '@skinkey/rules';
import { useTheme } from '@/theme/ThemeProvider';
import { AppBar, Body, Card, EmptyState, FooterFade, Icon, IconButton, PageBackdrop, PillButton, Tag, Txt } from '@/components';
import { glyphFromKey, loadScanLedger, useKey, ZoneGlyph } from '@/features/key';
import { BetterMatches, guessCategory, storeLinks, StoreSearchSheet, useBetterMatches } from '@/features/matches';
import { openStoreUrl } from '@/features/matches/openStoreUrl';
import { CropStep, inputFromPaste, sampleInput, takeShare, type CheckInput } from '@/features/share';
import { demo } from '@/demo';
import { workerCheckApi } from './api';
import { HowThisWasMadeSheet } from './components/HowThisWasMadeSheet';
import { LabelCamera } from './components/LabelCamera';
import { HeadSkeleton, HeroSkeleton, ProductHeader, ProductHero } from './components/ProductHeader';
import { SaveHeart } from '@/components/SaveHeart';
import { SkuConfirmSheet } from './components/SkuConfirmSheet';
import { UnknownPanel } from './components/UnknownPanel';
import { VerdictSheet } from './components/VerdictSheet';
import { categoryGlyph, shortListingTitle, sizeMeta } from './display';
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

/** Row title in the showcase cards: 15 medium. */
const ROW_TITLE = { fontFamily: 'Geist_500Medium', fontSize: 15, lineHeight: 20, letterSpacing: -0.1 } as const;

/** Compact "No reading yet" card, always under the verdict (DESIGN.md §9.4). */
function NoReadingCard({ onScan, onDemo }: { onScan: () => void; onDemo: () => void }) {
  const t = useTheme();
  return (
    <Card variant="raised" testID="no-key" gap={t.space[4]}>
      <View style={{ gap: t.space[1] }}>
        <Txt accessibilityRole="header" variant="section" style={ROW_TITLE}>
          {COPY.reading.none}
        </Txt>
        <Body small muted>
          Scan for reasons based on your readings.
        </Body>
      </View>
      <View style={{ gap: t.space[1] }}>
        <PillButton label="Start scan" variant="secondary" leadingIcon="face-frame" onPress={onScan} />
        <PillButton label={COPY.reading.useDemo} variant="tertiary" trailingIcon="chevron-right" onPress={onDemo} style={{ alignSelf: 'center' }} />
      </View>
    </Card>
  );
}

/**
 * "Better matches" jump, a quiet muted text button (DESIGN.md §8.7). It sits in the dock, above the primary row, only while that section is
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[1], paddingHorizontal: t.space[3], opacity: pressed ? 0.6 : 1 }}>
            <Txt variant="label" style={{ color: t.colors.textMuted, fontFamily: 'Geist_500Medium', fontSize: 14, lineHeight: 20 }}>
              Better matches
            </Txt>
            <Icon name="chevron-down" size={t.icon.sm} color={t.colors.textMuted} />
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

  // Scroll geometry: the "Better matches" pill shows only while that section is off screen (component.actionBar).
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const sheetY = useRef(0);
  const reasonsY = useRef<number | null>(null);
  const matchesY = useRef<number | null>(null);
  const geo = useRef({ y: 0, viewport: 0, content: 0 });
  const [matchesOnScreen, setMatchesOnScreen] = useState(false);
  // The dock floats on the page (showcase 04_report); its top hairline shows only while content sits under it.
  const [contentUnder, setContentUnder] = useState(false);
  const measure = useCallback(() => {
    const { y, viewport, content } = geo.current;
    const top = matchesY.current == null ? null : sheetY.current + matchesY.current;
    setMatchesOnScreen(top != null && y + viewport > top + t.space[12]);
    setContentUnder(viewport > 0 && y + viewport < content - 1);
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
  const toReasons = () => {
    if (reasonsY.current == null) return;
    scroll.current?.scrollTo({ y: Math.max(0, sheetY.current + reasonsY.current - t.space[2]), animated: true });
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
  const rawTitle =
    result?.title ?? (state.phase === 'resolving' ? state.title : state.phase === 'confirm' || state.phase === 'loading' ? state.resolve.extractedTitle : null);
  // A share with no readable title (resolve gave no extractedTitle) gets a plain "<Store> product" once loading ends;
  // the grey skeleton bars only stand in while the link is still being read.
  const fallbackTitle = state.phase === 'resolving' ? null : `${storeName ?? 'Shared'} product`;
  const header =
    result?.product != null
      ? nameOnly(result.product)
      : state.phase === 'loading'
        ? nameOnly(state.candidate.product)
        : rawTitle
          ? shortListingTitle(rawTitle)
          : fallbackTitle;
  const headerProduct = result?.product ?? (state.phase === 'loading' ? state.candidate.product : null);
  // The source is plain muted text in the meta line ("50g · Pasted link"), never a pill above the title (no eyebrow).
  const source = origin ? sourceLine(origin, store) : null;
  const size = headerProduct ? sizeMeta(headerProduct.size) : null;
  const headerMeta = [size, source].filter(Boolean).join(' · ') || null;
  // Key ingredients: the catalogue INCI in label order, names only (no claims about them).
  const ingredients = useMemo(
    () =>
      result?.product
        ? [...result.product.inci]
            .sort((a, b) => a.position - b.position)
            .map((i) => i.token.replace(/(^|[\s-])([a-z])/g, (_m, p: string, c: string) => p + c.toUpperCase()))
        : undefined,
    [result?.product],
  );

  const inlineDock = fontScale >= t.components.actionBar.inlineAtFontScale;
  const showMore = !!view && view.showMatches;
  const showPill = !!view && view.showMatches && !matchesOnScreen && !inlineDock;
  // The dock carries the one slate primary (the way back, showcase 04_report); in-content next steps (Snap the
  // ingredient list, Start scan) are the grey secondary pill, so there is one filled primary per view (DESIGN.md §8.1).
  const dockActions =
    view && result ? (
      <View style={{ gap: t.space[1] }}>
      {showPill ? <MatchesPill onPress={toMatches} /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.components.actionBar.gap }}>
        <View style={{ flex: 1 }}>
          <PillButton
            label={backLabel}
            variant="primary"
            onPress={backToProduct}
            trailingIcon={toListing ? 'arrow-up-right' : undefined}
            accessibilityHint={backDestination}
            testID="back-to-product"
          />
        </View>
        {showMore ? (
          <IconButton
            icon="more-horizontal"
            accessibilityLabel="More: search the stores"
            onPress={() => setMoreOpen(true)}
            testID="dock-more"
            color={t.colors.text}
            style={t.dark ? { backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border } : { backgroundColor: t.colors.bgSunken }}
          />
        ) : null}
      </View>
      </View>
    ) : null;

  const dock =
    dockActions && !inlineDock ? (
      <View
        style={{
          // The dock sits on the flat page tone (tokens 2.3): no shadow and no hairline in light; dark keeps its sheen
          // edge while content scrolls under it.
          backgroundColor: !t.dark || contentUnder ? t.colors.bg : t.components.actionBar.bg,
          borderTopWidth: contentUnder && t.dark ? 1 : 0,
          borderTopColor: t.dark ? t.colors.sheenEdge : t.components.actionBar.border,
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
      <PageBackdrop />
      <AppBar onBack={goBack} title="Your check" />

      {state.phase === 'crop' ? (
        <CropStep uri={state.image.uri} width={state.image.width} height={state.image.height} onCropped={flow.sendCrop} onCancel={goBack} />
      ) : (
        <View style={{ flex: 1 }}>
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
              paddingBottom: inlineDock ? insets.bottom + t.space[6] : t.space[10] + t.space[4],
              gap: t.spacing.stackLg,
            }}
          >
            {headerProduct && state.phase !== 'idle' && state.phase !== 'error' && state.phase !== 'not_skincare' ? (
              <ProductHero
                brand={headerProduct.brand}
                name={headerProduct.name}
                meta={headerMeta}
                category={headerProduct.category}
                trailing={result?.product ? <SaveHeart productId={result.product.id} /> : null}
              />
            ) : state.phase === 'resolving' && !header ? (
              <HeroSkeleton />
            ) : state.phase !== 'idle' && state.phase !== 'error' && state.phase !== 'not_skincare' ? (
              <ProductHeader title={header} meta={headerMeta} glyph={categoryGlyph(headerProduct?.category ?? category)} />
            ) : origin && state.phase !== 'idle' ? (
              <Txt variant="caption" tone="muted" testID="source-line">
                {sourceLine(origin, store)}
              </Txt>
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
                  ingredients={ingredients}
                  onHeadPress={toReasons}
                  onReasonsLayout={(y) => {
                    reasonsY.current = y;
                  }}
                  afterHead={
                    !key && !medicine ? (
                      <NoReadingCard onScan={() => router.push('/scan')} onDemo={chooseDemo} />
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
          {dock && contentUnder && t.dark ? <FooterFade /> : null}
        </View>
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
