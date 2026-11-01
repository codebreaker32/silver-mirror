import { COPY, type DeleteState } from '@skinkey/contracts';

export const DELETED_LABEL = 'Deleted from YouCam ✓';
export const PHOTO_DELETED_STAMP = 'Photo deleted';

export function deleteStateLabel(state: DeleteState): string {
  switch (state) {
    case 'deleted':
      return DELETED_LABEL;
    case 'delete_failed':
      return COPY.deleteFailed;
    case 'orphan':
      return `Orphan upload: ${COPY.orphanUpload}`;
    case 'delete_requested':
      return 'Asking YouCam to delete it';
    case 'uploaded':
      return 'Uploaded, not processed yet';
    case 'task_created':
    case 'running':
      return 'Processing at YouCam';
    case 'terminal_success':
    case 'terminal_error':
    case 'result_read':
      return 'Finished, waiting to delete';
  }
}

export const FINAL_DELETE_STATES: readonly DeleteState[] = ['deleted', 'delete_failed', 'orphan'];

export const isFinalDeleteState = (s: DeleteState) => FINAL_DELETE_STATES.includes(s);
