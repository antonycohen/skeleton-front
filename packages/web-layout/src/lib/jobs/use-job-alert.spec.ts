// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useJobStore } from './job-store';
import { useJobAlert } from './use-job-alert';

const options = { name: 'Record generation', pendingUrl: '/w/1/records/r-1/building', completedUrl: '/w/1/records/r-1' };

const ids = () => useJobStore.getState().jobs.map((job) => job.id);

beforeEach(() => {
  useJobStore.getState().clearAll();
});

describe('useJobAlert', () => {
  // T-261: every retry is a new job; the ended run must not stay beside it, nor the new one go untracked.
  it('puts a retry in place of the ended run it follows', () => {
    const { result } = renderHook(() => useJobAlert(options));

    act(() => result.current.start('job-1'));
    act(() => useJobStore.getState().updateJobStatus('job-1', 'failed'));
    act(() => result.current.start('job-2'));

    expect(ids()).toEqual(['job-2']);
    expect(useJobStore.getState().jobs[0].status).toBe('running');
  });

  it('puts a retry in place of an ended run of the same page registered before a reload', () => {
    useJobStore.getState().registerJob({ id: 'job-1', ...options });
    useJobStore.getState().registerJob({ id: 'other', ...options, name: 'Record import' });
    act(() => useJobStore.getState().updateJobStatus('job-1', 'failed'));
    act(() => useJobStore.getState().updateJobStatus('other', 'completed'));
    const { result } = renderHook(() => useJobAlert({ ...options, replacesEndedRuns: true }));

    act(() => result.current.start('job-2'));

    expect(ids()).toEqual(['other', 'job-2']);
  });

  it('leaves the ended runs it did not start to a caller whose pending URL is shared', () => {
    useJobStore.getState().registerJob({ id: 'job-1', ...options });
    act(() => useJobStore.getState().updateJobStatus('job-1', 'completed'));
    const { result } = renderHook(() => useJobAlert(options));

    act(() => result.current.start('job-2'));

    expect(ids()).toEqual(['job-1', 'job-2']);
  });

  it('keeps a run still under way beside a new one', () => {
    const { result } = renderHook(() => useJobAlert(options));

    act(() => result.current.start('job-1'));
    act(() => result.current.start('job-2'));

    expect(ids()).toEqual(['job-1', 'job-2']);
  });

  it('merges a job registered again', () => {
    const { result } = renderHook(() => useJobAlert({ ...options, meta: { pageId: 'p-1' } }));

    act(() => result.current.start('job-1'));
    act(() => result.current.start('job-1'));

    expect(ids()).toEqual(['job-1']);
    expect(useJobStore.getState().jobs[0].meta).toEqual({ pageId: 'p-1' });
  });
});
