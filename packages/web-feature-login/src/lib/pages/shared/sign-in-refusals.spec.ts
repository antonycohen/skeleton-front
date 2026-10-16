import { describe, expect, it } from 'vitest';
import { asSignInRefusal } from './sign-in-refusals';

describe('asSignInRefusal', () => {
  it('names a refusal the portal can resolve', () => {
    expect(asSignInRefusal('sso_required')).toBe('sso_required');
  });

  it('ignores anything else, names every object inherits included', () => {
    expect(asSignInRefusal('denied')).toBeNull();
    expect(asSignInRefusal('constructor')).toBeNull();
    expect(asSignInRefusal('toString')).toBeNull();
    expect(asSignInRefusal(undefined)).toBeNull();
  });
});
