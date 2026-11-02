import { useState, type ReactNode } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { FaceFrame, SheenBackdrop } from '@/brand';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from '../Icon';
import { IconDisc } from '../IconButton';
import { Txt } from '../Text';

/** Face-frame plate on the pearl sheen (consent hero). Decorative: the title beside it says what happens. */
export function FaceFramePlate({ maxWidth = 136 }: { maxWidth?: number }) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const frame = Math.min(maxWidth, Math.round((width - t.spacing.gutter * 2) * 0.46));
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        borderRadius: t.radius.xl,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: t.space[5],
        borderWidth: t.dark ? 1 : 0,
        borderColor: t.colors.border,
        borderTopColor: t.colors.sheenEdge,
      }}
    >
      <SheenBackdrop radius={t.radius.xl} />
      <FaceFrame width={frame} tile={false} />
    </View>
  );
}

export interface PromiseItem {
  icon: IconName;
  label: string;
}

/** Three icon-disc promise rows ("One photo, analysed by YouCam" …). One TalkBack node per row. */
export function PromiseList({ items }: { items: readonly PromiseItem[] }) {
  const t = useTheme();
  return (
    <View accessibilityRole="list" style={{ gap: t.space[3] }}>
      {items.map((it) => (
        <View key={it.label} accessible accessibilityLabel={it.label} style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4], minHeight: t.touch.min }}>
          <IconDisc icon={it.icon} />
          <Txt variant="bodyStrong" style={{ flex: 1 }}>
            {it.label}
          </Txt>
        </View>
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
      <Icon name={(keep ? cs.keepIcon : cs.dropIcon) as IconName} size={t.icon.md} color={keep ? t.colors.text : t.colors.textMuted} />
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
        backgroundColor: k.bg,
        borderRadius: k.radius,
        padding: k.padding,
        gap: t.space[2],
        borderWidth: 1,
        borderColor: k.border,
        borderTopColor: t.dark ? t.colors.sheenEdge : k.border,
      }}
    >
      <Txt variant="section" style={k.title}>
        {title}
      </Txt>
      <View style={{ gap: t.space[1] }}>{kept.map((l) => row(l, true))}</View>
      <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: t.space[1] }} />
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
