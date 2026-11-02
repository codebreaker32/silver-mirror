import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COPY } from '@skinkey/contracts';
import {
  BandChip,
  BrandLockup,
  ButtonPair,
  Card,
  Caption,
  Chip,
  ChipRow,
  Divider,
  EmptyState,
  FocusTiles,
  Heading,
  IconButton,
  IconDisc,
  Ledger,
  ListGroup,
  ListRow,
  PillButton,
  ProductCard,
  SectionHeader,
  StepChecklist,
  Tag,
  Txt,
  VerdictHead,
} from '@/components';
import { demo } from '@/demo';
import { useTheme } from '@/theme/ThemeProvider';

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
  if (!demo) return <Redirect href="/" />;
  const p = part ?? '1';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.bg }} contentContainerStyle={{ paddingTop: insets.top + t.space[2], paddingBottom: t.space[10], paddingHorizontal: t.spacing.gutter, gap: t.space[5] }}>
      {p === '1' ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <BrandLockup variant="header" />
            <IconButton icon="gear" accessibilityLabel="Settings" onPress={noop} />
          </View>
          <Heading level="display">Good evening</Heading>
          <PillButton label="Start scan" trailingIcon="arrow-right" onPress={noop} />
          <PillButton label={COPY.reading.useDemo} variant="secondary" onPress={noop} />
          <View style={{ flexDirection: 'row', gap: t.space[2], alignItems: 'center' }}>
            <PillButton label="See all" variant="tertiary" trailingIcon="chevron-right" onPress={noop} />
            <PillButton label={COPY.reading.delete} variant="destructiveNeutral" onPress={noop} />
          </View>
          <ButtonPair>
            <PillButton label="Start scan" variant="consentPair" onPress={noop} />
            <PillButton label="Not now" variant="consentPair" onPress={noop} />
          </ButtonPair>
          <PillButton label="Back to Nykaa listing" onPress={noop} disabled />
          <SectionHeader title="Better matches" supporting="Ranked by fit to your readings. No paid placements." action={{ label: 'See all', onPress: noop }} />
          <ChipRow>
            <Chip label="For your oiliness" selected={filter === 'oil'} onPress={() => setFilter('oil')} />
            <Chip label="Fragrance-free" selected={filter === 'ff'} onPress={() => setFilter('ff')} />
            <Chip label="Lighter textures" selected={filter === 'lt'} onPress={() => setFilter('lt')} />
          </ChipRow>
          <ChipRow>
            <Tag label="FITS" variant={{ verdict: 'fits' }} />
            <Tag label="CAUTION" variant={{ verdict: 'caution' }} />
            <Tag label="UNKNOWN" variant={{ verdict: 'unknown' }} />
            <Tag label={COPY.reading.demo} variant="demo" />
            <Tag label={COPY.selfReported} variant="outline" />
          </ChipRow>
          <ProductCard hero name="Minimalist Oil-Free Gel Moisturiser" reason="Light gel, no fragrance" verdict={{ tone: 'fits', label: 'FITS' }} destination="Opens an Amazon.in search" glyph="jar" onPress={noop} />
          <ProductCard name="Sunscreen SPF 50 Matte Fluid" reason="Contains fragrance (parfum)" verdict={{ tone: 'caution', label: 'CAUTION' }} glyph="tube" onPress={noop} />
        </>
      ) : null}

      {p === '2' ? (
        <>
          <VerdictHead tone="fits" line={COPY.subtitle.FITS} />
          <VerdictHead tone="caution" line={COPY.subtitle.CAUTION} demo />
          <VerdictHead tone="unknown" line={COPY.subtitle.UNKNOWN} />
          <VerdictHead tone="fits" line={COPY.subtitle.FITS} nameOnly />
          <VerdictHead tone="medicine" line={COPY.medicine('adapalene')} />
          <Ledger
            rows={[
              { key: 'Reading', value: 'Your scan, 1 Nov', sub: 'Bands only, on this phone' },
              { key: 'Product', value: 'Catalogue entry, checked against the brand page', links: [{ label: 'Brand page', url: 'https://example.com' }] },
              { key: 'Rules', value: 'Published rules (version b7cbc69)' },
              { key: 'Limits', value: 'Cosmetic guidance, not medical advice.' },
            ]}
          />
        </>
      ) : null}

      {p === '3' ? (
        <>
          <Card>
            <View style={{ flexDirection: 'row', gap: t.space[3], alignItems: 'center' }}>
              <IconDisc icon="droplet" />
              <View style={{ flex: 1 }}>
                <Txt variant="section">{COPY.reading.yours}</Txt>
                <Txt variant="headline">Skin-type reading: Combination</Txt>
                <Caption>Scan 2 Nov · photo deleted</Caption>
              </View>
            </View>
            <ChipRow>
              <BandChip name="Oiliness" level="High" />
              <BandChip name="Redness" level="Medium" />
              <BandChip name="Moisture" level="Low" selfReported />
            </ChipRow>
          </Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space[3] }}>
            <BandChip variant="tile" name="Oiliness" level="High" />
            <BandChip variant="tile" name="Pore" level={null} />
          </View>
          <FocusTiles
            items={[
              { label: 'Lighter textures', icon: 'waves' },
              { label: 'Hydration', icon: 'droplet' },
              { label: 'Fragrance-free', icon: 'spray-off' },
            ]}
          />
          <StepChecklist
            announcement={null}
            steps={[
              { id: 'upload', label: COPY.scanStepsDone.upload, state: 'done' },
              { id: 'analyse', label: COPY.scanStepsDone.analyse, state: 'done' },
              { id: 'read', label: COPY.scanSteps.read, state: 'active' },
              { id: 'delete', label: COPY.scanSteps.delete, state: 'pending' },
            ]}
          />
          <ListGroup title="Your data">
            <ListRow title={COPY.reading.delete} leadingIcon="trash" onPress={noop} />
            <ListRow title="What stays on this phone" supporting="Bands, zone labels, scan date" leadingIcon="phone-lock" onPress={noop} />
            <ListRow title="Published rules" leadingIcon="document" trailing="external" onPress={noop} />
          </ListGroup>
          <Divider />
          <EmptyState title={COPY.reading.none} body="Scan once, about a minute.">
            <PillButton label="Start scan" onPress={noop} />
            <PillButton label={COPY.reading.useDemo} variant="secondary" onPress={noop} />
          </EmptyState>
        </>
      ) : null}
    </ScrollView>
  );
}
