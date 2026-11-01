import type { DeleteState, FileRecord } from '@skinkey/contracts';
import type { TaskKind } from '../youcam/types';

/**
 * Spec §3 delete state machine, one record per uploaded file:
 * uploaded → task_created → running → terminal(success|error) → result_read → delete_requested → deleted | delete_failed,
 * plus `orphan` for an upload that never got a task (nothing to delete; YouCam auto-removes within 30 days).
 */
const EDGES: Record<DeleteState, readonly DeleteState[]> = {
  uploaded: ['task_created', 'orphan'],
  task_created: ['running', 'terminal_success', 'terminal_error', 'deleted'],
  running: ['running', 'terminal_success', 'terminal_error', 'deleted'],
  terminal_success: ['result_read'],
  terminal_error: ['delete_requested', 'delete_failed'],
  result_read: ['delete_requested', 'delete_failed'],
  delete_requested: ['delete_requested', 'deleted', 'delete_failed'],
  deleted: [],
  delete_failed: [],
  orphan: [],
};

export class IllegalTransition extends Error {
  constructor(
    readonly from: DeleteState,
    readonly to: DeleteState,
  ) {
    super(`illegal delete-state transition ${from} → ${to}`);
  }
}

export const canTransition = (from: DeleteState, to: DeleteState) => EDGES[from].includes(to);

export const transition = (from: DeleteState, to: DeleteState): DeleteState => {
  if (!canTransition(from, to)) throw new IllegalTransition(from, to);
  return to;
};

const ORDER: readonly DeleteState[] = [
  'uploaded',
  'task_created',
  'running',
  'terminal_error',
  'terminal_success',
  'result_read',
  'delete_requested',
  'deleted',
];

export const isTerminalTask = (s: DeleteState) => s === 'terminal_success' || s === 'terminal_error' || s === 'result_read';
export const isDeleteFinal = (s: DeleteState) => s === 'deleted' || s === 'delete_failed' || s === 'orphan';

export interface TaskRecord {
  taskId: string;
  kind: TaskKind;
  state: DeleteState;
  createdAt: number;
  terminalAt?: number;
  polls: number;
  lastPollAt?: number;
  units: number;
  error?: string;
  shadeName?: string;
  /** Signed result URL, kept only until the bytes are read in the delivering request. */
  resultUrl?: string;
  deleteAttempts: number;
  deleteRequestedAt?: number;
  confirmChecks: number;
  lastConfirmAt?: number;
  deletedAt?: number;
}

export const newTask = (taskId: string, kind: TaskKind, now: number, shadeName?: string): TaskRecord => ({
  taskId,
  kind,
  state: 'task_created',
  createdAt: now,
  polls: 0,
  units: 0,
  deleteAttempts: 0,
  confirmChecks: 0,
  ...(shadeName ? { shadeName } : {}),
});

export const setState = (task: TaskRecord, to: DeleteState) => {
  task.state = transition(task.state, to);
};

/**
 * G3 is unverified (does deleting task A break task B on the same file?), so the default is strict:
 * every task on the file is terminal and every success has been read before any delete is sent.
 */
export const readyToDelete = (tasks: readonly TaskRecord[]) =>
  tasks.length > 0 &&
  tasks.every((t) => t.state === 'terminal_error' || t.state === 'result_read' || t.state === 'delete_requested' || isDeleteFinal(t.state));

/** Aggregate state of one uploaded file across the tasks that ran on it. */
export const fileState = (fileState: 'uploaded' | 'orphan', tasks: readonly TaskRecord[]): DeleteState => {
  if (tasks.length === 0) return fileState;
  if (tasks.some((t) => t.state === 'delete_failed')) return 'delete_failed';
  return tasks.map((t) => t.state).reduce((lo, s) => (ORDER.indexOf(s) < ORDER.indexOf(lo) ? s : lo));
};

export const fileRecord = (fileId: string, state: 'uploaded' | 'orphan', tasks: readonly TaskRecord[]): FileRecord => ({
  fileId,
  state: fileState(state, tasks),
  taskIds: tasks.map((t) => t.taskId),
});
