/**
 * Silver Mirror shared UI kit (DESIGN.md §7–§8). Tokens only: every colour, size and font comes from useTheme().
 * Import from '@/components'. The old kits in features/check/ui and features/scan/ui re-export from here.
 */
export { Icon, VerdictIcon, ICON_NAMES, FILLED_ICONS, resolveIconName, type IconName, type LegacyIconName, type IconProps } from './Icon';
export { Txt, Heading, Body, Caption, Overline, Note, Section, textStyle, type TextTone } from './Text';
export { PillButton, PillButton as Button, ButtonPair, type ButtonVariant, type PillButtonProps } from './PillButton';
export { IconButton, IconDisc } from './IconButton';
export { TextLink } from './TextLink';
export { Card, useCardStyle, type CardVariant, type CardProps } from './Card';
export { Sheet, type SheetProps } from './Sheet';
export { Chip, ChipRow, ChipRail, Tag, KeepChip } from './Chip';
export { BandChip, BandMeter } from './BandChip';
export { FocusTile, FocusTiles, type FocusItem } from './FocusTile';
export { ListRow, ListGroup, ThumbTile, type ListRowProps, type ListRowThumb } from './ListRow';
export { Segmented, type SegmentedProps } from './Segmented';
export { SkinTypeCard, type SkinTypeCardProps } from './SkinTypeCard';
export { Ledger, type LedgerItem, type LedgerLinkItem } from './Ledger';
export { VerdictHead, type VerdictHeadProps } from './VerdictHead';
export { StepChecklist, checklistAnnouncement, type ChecklistStep } from './StepChecklist';
export { EmptyState, type EmptyPlate } from './EmptyState';
export { Divider } from './Divider';
export { SectionHeader } from './SectionHeader';
export { ProductCard, type ProductCardProps } from './ProductCard';
export { AppBar, FooterFade, PageBackdrop, Screen, TabScene, useInTabScene } from './Screen';
export { TabBar, TAB_ITEMS, type TabItem } from './TabBar';
export { useReduceMotion } from './useReduceMotion';
export { ProductArt, artShape, type ProductArtCategory, type ProductArtProps } from './ProductArt';
export { ToastProvider, useToast } from './Toast';
export { PressableScale, type PressableScaleProps } from './PressableScale';
export { Skeleton, type SkeletonProps } from './Skeleton';
export { haptic } from './haptics';
export { SilverMark, Wordmark, BrandLockup, SheenBackdrop, FaceFrame, LiquidBackdrop } from '@/brand';
