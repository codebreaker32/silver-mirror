import { describe, expect, it } from 'vitest';
import {
  canTransition,
  fileRecord,
  fileState,
  IllegalTransition,
  newTask,
  readyToDelete,
  transition,
  type TaskRecord,
} from '../src/jobs/deleteState';

const task = (state: TaskRecord['state']): TaskRecord => ({ ...newTask(`t-${state}`, 'makeup_vto', 0), state });

describe('delete state machine', () => {
  it('walks the happy path from the spec', () => {
    let s = transition('uploaded', 'task_created');
    for (const next of ['running', 'terminal_success', 'result_read', 'delete_requested', 'deleted'] as const) s = transition(s, next);
    expect(s).toBe('deleted');
  });

  it('never deletes before the result is read', () => {
    expect(canTransition('terminal_success', 'delete_requested')).toBe(false);
    expect(canTransition('running', 'delete_requested')).toBe(false);
    expect(() => transition('task_created', 'delete_requested')).toThrow(IllegalTransition);
  });

  it('lets an error task be deleted (G6) and treats orphan, deleted and delete_failed as final', () => {
    expect(canTransition('terminal_error', 'delete_requested')).toBe(true);
    for (const final of ['orphan', 'deleted', 'delete_failed'] as const)
      for (const to of ['task_created', 'delete_requested', 'deleted'] as const) expect(canTransition(final, to)).toBe(false);
  });

  it('only an upload with no task can become an orphan', () => {
    expect(canTransition('uploaded', 'orphan')).toBe(true);
    expect(canTransition('task_created', 'orphan')).toBe(false);
  });

  it('waits for every task on a shared file to be terminal and read (G3 strict default)', () => {
    expect(readyToDelete([task('result_read'), task('running')])).toBe(false);
    expect(readyToDelete([task('result_read'), task('terminal_success')])).toBe(false);
    expect(readyToDelete([task('result_read'), task('terminal_error')])).toBe(true);
    expect(readyToDelete([])).toBe(false);
  });

  it('aggregates one file record across its tasks', () => {
    expect(fileState('uploaded', [])).toBe('uploaded');
    expect(fileState('orphan', [])).toBe('orphan');
    expect(fileState('uploaded', [task('deleted'), task('delete_requested')])).toBe('delete_requested');
    expect(fileState('uploaded', [task('deleted'), task('deleted')])).toBe('deleted');
    expect(fileState('uploaded', [task('deleted'), task('delete_failed')])).toBe('delete_failed');
    expect(fileRecord('f1', 'uploaded', [task('running'), task('result_read')])).toEqual({
      fileId: 'f1',
      state: 'running',
      taskIds: ['t-running', 't-result_read'],
    });
  });
});
