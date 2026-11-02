import { Fragment, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { FaceFrame } from '@/brand';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from '../Icon';
import { useCardStyle } from '../Card';
import { ThumbTile } from '../ListRow';
import { Txt } from '../Text';

/**
 * Face-frame plate (consent hero, tokens 2.3): a 200dp plate on the flat surface tone with the
 * bracket illustration centred. Decorative: the app-bar title says what happens.
 */
export function FaceFramePlate({ height = 200 }: { height?: number; /** @deprecated plate is sized by height now */ maxWidth?: number }) {
  const t = useTheme();
  const f = t.components.faceFrame;
  const frame = Math.round((height - t.space[4] * 2) * f.aspect);
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        height,
        borderRadius: t.radius.lg,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: t.colors.surface,
        borderWidth: t.dark ? 1 : 0,
        borderColor: t.colors.border,
        borderTopColor: t.dark ? t.colors.sheenEdge : t.colors.border,
      }}
    >
      <FaceFrame width={frame} tile={false} />
    </View>
  );
}

export interface PromiseItem {
  icon: IconName;
  label: string;
}

/**
 * The three promises ("One photo, analysed by YouCam" …) as rows on one surface-tone card (well-tone square tile,
 * ink icon, rows separated by spacing, no dividers). A 48dp tile and body weight keep each promise on one line at 1.0x.
 * One TalkBack node per row.
 */
export function PromiseList({ items }: { items: readonly PromiseItem[] }) {
  const t = useTheme();
  const card = useCardStyle('raised');
  const tile = t.touch.min;
  const padX = t.spacing.insetCard;
  const gap = t.space[4];
  return (
    <View accessibilityRole="list" style={[card, { paddingHorizontal: 0, paddingVertical: t.space[1], gap: 0 }]}>
      {items.map((it, i) => (
        <Fragment key={it.label}>
          <View accessible accessibilityLabel={it.label} style={{ flexDirection: 'row', alignItems: 'center', gap, minHeight: t.space[16], paddingHorizontal: padX, paddingVertical: t.space[2] }}>
            <ThumbTile thumb={{ icon: it.icon }} size={tile} />
            <Txt variant="body" style={{ flex: 1 }}>
              {it.label}
            </Txt>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

/**
 * "What stays on this phone" card (consentSheet.keepBox): a checklist of what is kept (check-circle) and what is
 * not (minus-circle). Read as one block so the kept / not-kept split is never lost.
 */
export function KeepCard({ title, kept, dropped, footnote }: { title: string; kept: readonly string[]; dropped: readonly string[]; footnote?: string }) {
  const t = useTheme();
  const cs = t.components.consentSheet;
  const k = cs.keepBox;
  const a11y = `${title}. Kept: ${kept.join(', ')}. Not kept: ${dropped.join(', ')}.${footnote ? ` ${footnote}` : ''}`;
  const row = (label: string, keep: boolean) => (
    <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[3], minHeight: 32 }}>
      <Icon name={(keep ? cs.keepIcon : cs.dropIcon) as IconName} size={t.icon.md} color={t.colors.onIconDisc} />
      <Txt variant="body" style={[cs.keepList, { flex: 1, color: keep ? t.colors.text : t.colors.textMuted }]}>
        {label}
      </Txt>
    </View>
  );
  return (
    <View
      accessible
      accessibilityLabel={a11y}
      style={{
        backgroundColor: t.dark ? k.bg : t.colors.surface,
        borderRadius: t.radius.lg,
        padding: k.padding,
        gap: t.space[2],
        borderWidth: t.dark ? 1 : 0,
        borderColor: k.border,
        borderTopColor: t.dark ? t.colors.sheenEdge : k.border,
      }}
    >
      <Txt variant="section" style={k.title}>
        {title}
      </Txt>
      <View style={{ gap: t.space[1] }}>{kept.map((l) => row(l, true))}</View>
      <View style={{ height: t.space[2] }} />
      <View style={{ gap: t.space[1] }}>{dropped.map((l) => row(l, false))}</View>
      {footnote ? (
        <Txt variant="bodySm" tone="muted">
          {footnote}
        </Txt>
      ) : null}
    </View>
  );
}

/** A "Details" disclosure row (48dp) that reveals one muted paragraph, e.g. COPY.privacyQualifier. */
export function DetailsRow({ label = 'Details', children }: { label?: string; children: ReactNode }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: t.space[1] }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => ({ minHeight: t.touch.min, flexDirection: 'row', alignItems: 'center', gap: t.space[2], alignSelf: 'flex-start', opacity: pressed ? 0.7 : 1 })}
      >
        <Txt variant="label" style={{ color: t.components.button.tertiary.fg }}>
          {label}
        </Txt>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon name="chevron-down" size={t.icon.sm} color={t.components.button.tertiary.fg} strokeWidth={2} />
        </View>
      </Pressable>
      {open ? (
        <Txt variant="bodySm" tone="muted">
          {children}
        </Txt>
      ) : null}
    </View>
  );
}
