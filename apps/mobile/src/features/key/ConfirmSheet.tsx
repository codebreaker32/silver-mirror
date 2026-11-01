import { useState } from 'react';
import { COPY } from '@skinkey/contracts';
import { Body, Button, Sheet } from '../scan/ui';

export type ConfirmKind = 'delete' | 'withdraw';

const TEXT: Record<ConfirmKind, { title: string; body: string; action: string; busy: string }> = {
  delete: {
    title: 'Delete your Key?',
    body: 'This removes your skin-type reading, bands, zone labels and scan date from this phone. There is no undo.',
    action: 'Delete Key',
    busy: 'Deleting…',
  },
  withdraw: {
    title: 'Withdraw consent?',
    body: 'This deletes your Key from this phone and SkinKey stops using your readings. SkinKey kept no photo.',
    action: 'Withdraw consent',
    busy: 'Withdrawing…',
  },
};

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
            variant="destructiveNeutral"
            icon="trash"
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
          <Button label="Cancel" variant="tertiary" onPress={onClose} />
        </>
      }
    >
      <Body>{t.body}</Body>
      {kind === 'withdraw' ? <Body muted small>{COPY.privacyQualifier}</Body> : null}
    </Sheet>
  );
}
