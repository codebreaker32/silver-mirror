import { useState } from 'react';
import { COPY } from '@skinkey/contracts';
import { Body, Button, Sheet } from '@/components';

export type ConfirmKind = 'delete' | 'withdraw';

const TEXT: Record<ConfirmKind, { title: string; body: string; action: string; busy: string }> = {
  delete: {
    title: 'Delete your reading?',
    body: 'This removes your skin-type reading, bands, zone labels and scan date from this phone. There is no undo.',
    action: COPY.reading.delete,
    busy: 'Deleting…',
  },
  withdraw: {
    title: 'Withdraw consent?',
    body: `This deletes your reading from this phone and ${COPY.appName} stops using your readings. ${COPY.appName} kept no photo.`,
    action: 'Withdraw consent',
    busy: 'Withdrawing…',
  },
};

/** Confirm sheet: the destructive confirm is the one slate pill with an explicit verb (never red); Cancel is tonal. */
export function ConfirmSheet({ kind, onClose, onConfirm }: { kind: ConfirmKind | null; onClose: () => void; onConfirm: (k: ConfirmKind) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const t = TEXT[kind ?? 'delete'];
  return (
    <Sheet
      visible={kind !== null}
      title={t.title}
      onClose={onClose}
      actions={
        <>
          <Button
            label={t.action}
            busy={busy}
            busyLabel={t.busy}
            leadingIcon="trash"
            onPress={async () => {
              if (!kind) return;
              setBusy(true);
              try {
                await onConfirm(kind);
              } finally {
                setBusy(false);
              }
            }}
          />
          <Button label="Cancel" variant="secondary" onPress={onClose} />
        </>
      }
    >
      <Body>{t.body}</Body>
    </Sheet>
  );
}
