import {describe, expect, it} from 'vitest';
import {getActiveNavigation} from './get-active-navigation';

const base = '/w/org-1';

describe('getActiveNavigation', () => {
  it('activates Dashboard on the dashboard', () => {
    expect(getActiveNavigation(`${base}/dashboard`, base)).toEqual({
      dashboard: true, assistant: false,
    });
  });

  it('activates Assistant on the list and on a conversation', () => {
    expect(getActiveNavigation(`${base}/assistant`, base).assistant).toBe(true);
    expect(getActiveNavigation(`${base}/assistant/c-1`, base).assistant).toBe(true);
  });

  it('activates nothing elsewhere', () => {
    expect(getActiveNavigation(`${base}/workspaces`, base)).toEqual({
      dashboard: false, assistant: false,
    });
  });
});
