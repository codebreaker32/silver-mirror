import { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COPY } from '@skinkey/contracts';
import {
  BandChip,
  ButtonPair,
  Card,
  Chip,
  ChipRail,
  ChipRow,
  Divider,
  EmptyState,
  FocusTiles,
  Heading,
  Icon,
  IconButton,
  Ledger,
  ListGroup,
  ListRow,
  PillButton,
  ProductCard,
  SectionHeader,
  Segmented,
  SilverMark,
  SkinTypeCard,
  StepChecklist,
  Tag,
  Txt,
  VerdictHead,
  Wordmark,
} from '@/components';
import { demo } from '@/demo';
import { useTheme } from '@/theme/ThemeProvider';

const WELCOME_PHOTO = require('../../assets/images/welcome-backdrop.jpg');

const noop = () => undefined;

/**
 * Kit gallery for design review (scripts/shoot-mobile-web.mjs → kit-1..3). Web demo builds only (`?demo=`);
 * everywhere else it redirects Home. Not linked from any screen.
 */
export default function KitGallery() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { part } = useLocalSearchParams<{ part?: string }>();
  const [filter, setFilter] = useState('oil');
  const [store, setStore] = useState<'Flipkart' | 'Amazon' | 'Nykaa'>('Flipkart');
  if (!demo) return <Redirect href="/" />;
  const p = part ?? '1';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.bg }} contentContainerStyle={{ paddingTop: insets.top + t.space[2], paddingBottom: t.space[10], paddingHorizontal: t.spacing.gutter, gap: t.space[5] }}>
      {p === '1' ? (
        <>
          {/* Home (showcase 02_home): greeting row, skin-type card, share steps as thumb rows, pills. */}
          <View style={{ gap: t.space[2] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level="display">Good afternoon</Heading>
              <IconButton icon="gear" accessibilityLabel="Settings" onPress={noop} />
            </View>
            <Txt tone="muted">{COPY.welcome.tagline}</Txt>
          </View>
          <SkinTypeCard value="Combination" caption="Scan 1 Nov · photo deleted" onPress={noop} />
          <View style={{ gap: t.space[3] }}>
            <SectionHeader title="Share from a store app" action={{ label: 'Got it', onPress: noop, chevron: false }} />
            <Segmented options={['Flipkart', 'Amazon', 'Nykaa'] as const} value={store} onChange={setStore} accessibilityLabel="Store app" />
            <ListGroup thumbs accessibilityLabel={COPY.sharePaths.join('. ')}>
              {COPY.shareSteps(store).map((step, i) => (
                <ListRow key={step.title} title={step.title} supporting={step.supporting} trailing="none" thumb={i === 0 ? { icon: 'share' } : i === 1 ? { mark: true } : { icon: 'seal-check' }} />
              ))}
            </ListGroup>
          </View>
          <PillButton label="Start scan" trailingIcon="arrow-right" onPress={noop} />
          <PillButton label={COPY.reading.useDemo} variant="secondary" onPress={noop} />
          <SkinTypeCard value="Scan once, about a minute" label={COPY.reading.none} icon="face-frame" quiet>
            <PillButton label="Start scan" trailingIcon="arrow-right" onPress={noop} />
            <PillButton label={COPY.reading.useDemo} variant="secondary" onPress={noop} />
          </SkinTypeCard>
        </>
      ) : null}

      {p === '2' ? (
        <>
          {/* Report + analyze + discover (showcase 04_report / 03_analyze / 06_discover). */}
          <SkinTypeCard size="hero" label="Skin type" value="Combination" line="Oily in the T-zone, normal on the cheeks." />
          <View style={{ gap: t.space[3] }}>
            <SectionHeader title={COPY.reading.keyReadings} />
            <ChipRail>
              <Chip label="Oiliness · High" accessibilityLabel="Oiliness, High" />
              <Chip label="Redness · Medium" accessibilityLabel="Redness, Medium" />
              <Chip label="Moisture · Low" accessibilityLabel="Moisture, Low" />
            </ChipRail>
          </View>
          <View style={{ gap: t.space[3] }}>
            <SectionHeader title="What this means for products" />
            <FocusTiles
              items={[
                { label: 'Lighter textures', icon: 'waves' },
                { label: 'Hydration', icon: 'droplet' },
                { label: 'Fragrance-free', icon: 'spray-off' },
              ]}
            />
          </View>
          <StepChecklist
            announcement={null}
            steps={[
              { id: 'upload', label: COPY.scanStepsDone.upload, state: 'done' },
              { id: 'analyse', label: COPY.scanStepsDone.analyse, state: 'done' },
              { id: 'read', label: COPY.scanSteps.read, state: 'active' },
              { id: 'delete', label: COPY.scanSteps.delete, state: 'pending' },
            ]}
          />
          <ChipRail>
            <Chip label="For your oiliness" selected={filter === 'oil'} onPress={() => setFilter('oil')} />
            <Chip label="Fragrance-free" selected={filter === 'ff'} onPress={() => setFilter('ff')} />
            <Chip label="Lighter textures" selected={filter === 'lt'} onPress={() => setFilter('lt')} />
          </ChipRail>
          <View style={{ gap: t.space[1] }}>
            <Txt variant="section" style={{ fontFamily: 'Geist_600SemiBold', fontSize: 17, lineHeight: 22 }}>
              {COPY.matchesBanner('Combination')}
            </Txt>
            <Txt tone="muted" style={{ fontSize: 15, lineHeight: 22 }}>
              {COPY.betterMatchesHeader}
            </Txt>
          </View>
          <Card variant="raised" gap={t.space[5]}>
            <ProductCard name="Minimalist Oil-Free Gel Moisturiser" reason="Light gel, no fragrance" verdict={{ tone: 'fits', label: 'FITS' }} linkOut onPress={noop} />
            <ProductCard name="Sunscreen SPF 50 Matte Fluid" reason="Contains fragrance (parfum)" verdict={{ tone: 'caution', label: 'CAUTION' }} linkOut onPress={noop} />
          </Card>
        </>
      ) : null}

      {p === '3' ? (
        <>
          {/* Welcome panel: the neutral liquid-silver photo (as on Welcome), chrome S, serif wordmark, pills. */}
          <View style={{ minHeight: 420, borderRadius: t.radius.lg, overflow: 'hidden', padding: t.space[5], justifyContent: 'flex-end', gap: t.space[3] }}>
            <Image source={WELCOME_PHOTO} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />
            <View style={{ alignItems: 'center', gap: t.space[3], marginBottom: t.space[8] }}>
              <SilverMark size={t.components.brand.heroMark} tile={false} />
              <Wordmark capHeight={t.components.brand.wordmarkWelcome} header />
              <Txt tone="muted" style={{ textAlign: 'center' }}>
                {COPY.welcome.tagline}
              </Txt>
            </View>
            <PillButton label={COPY.welcome.start} trailingIcon="arrow-right" onPress={noop} />
            <PillButton label={COPY.reading.useDemo} variant="translucent" onPress={noop} />
          </View>
          {/* Tab glyphs: outline (inactive) and filled (active) on the bar colour. */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: t.space[3], backgroundColor: t.components.bottomNav.bg, borderRadius: t.radius.lg }}>
            {(['tag-check', 'face-frame', 'droplet'] as const).map((name) => (
              <View key={name} style={{ flexDirection: 'row', gap: t.space[3] }}>
                <Icon name={name} size={t.icon.lg} color={t.components.bottomNav.iconInactive} />
                <Icon name={name} size={t.icon.lg} filled knockout={t.components.bottomNav.bg} color={t.components.bottomNav.iconActive} />
              </View>
            ))}
          </View>
          <VerdictHead tone="fits" line={COPY.subtitle.FITS} />
          <VerdictHead tone="caution" line={COPY.subtitle.CAUTION} demo />
          <VerdictHead tone="unknown" line={COPY.subtitle.UNKNOWN} />
          <VerdictHead tone="medicine" line={COPY.medicine('adapalene')} />
          <VerdictHead tone="fits" line={COPY.subtitle.FITS} nameOnly />
          <Ledger
            rows={[
              { key: 'Reading', value: 'Your scan, 1 Nov', sub: 'Bands only, on this phone' },
              { key: 'Product', value: 'Catalogue entry, checked against the brand page', links: [{ label: 'Brand page', url: 'https://example.com' }] },
              { key: 'Rules', value: 'Published rules (version b7cbc69)' },
              { key: 'Limits', value: 'Cosmetic guidance, not medical advice.' },
            ]}
          />
          <ChipRow>
            <Tag label="FITS" variant={{ verdict: 'fits' }} />
            <Tag label="CAUTION" variant={{ verdict: 'caution' }} />
            <Tag label="UNKNOWN" variant={{ verdict: 'unknown' }} />
            <Tag label={COPY.reading.demo} variant="demo" />
            <Tag label={COPY.selfReported} variant="outline" />
          </ChipRow>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space[3] }}>
            <BandChip variant="tile" name="Oiliness" level="High" />
            <BandChip variant="tile" name="Pore" level={null} />
          </View>
          <View style={{ flexDirection: 'row', gap: t.space[2], alignItems: 'center' }}>
            <PillButton label="See all" variant="tertiary" trailingIcon="chevron-right" onPress={noop} />
            <PillButton label={COPY.reading.delete} variant="destructiveNeutral" onPress={noop} />
          </View>
          <ButtonPair>
            <PillButton label="Start scan" variant="consentPair" onPress={noop} />
            <PillButton label="Not now" variant="consentPair" onPress={noop} />
          </ButtonPair>
          <PillButton label="Back to Nykaa listing" onPress={noop} disabled />
          <ListGroup title="Your data">
            <ListRow title={COPY.reading.delete} leadingIcon="trash" onPress={noop} />
            <ListRow title="What stays on this phone" supporting="Bands, zone labels, scan date" leadingIcon="phone-lock" onPress={noop} />
            <ListRow title="Published rules" leadingIcon="document" trailing="external" onPress={noop} />
          </ListGroup>
          <Divider />
          <EmptyState title={COPY.reading.none} body="Scan once, about a minute.">
            <PillButton label="Start scan" trailingIcon="arrow-right" onPress={noop} />
            <PillButton label={COPY.reading.useDemo} variant="secondary" onPress={noop} />
          </EmptyState>
        </>
      ) : null}
    </ScrollView>
  );
}
