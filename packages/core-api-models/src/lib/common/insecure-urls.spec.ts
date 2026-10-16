import { afterEach, describe, expect, it, vi } from 'vitest';

/** The switch is read when the module loads: stub the environment, then import a fresh copy. */
const load = async (allowInsecure: string | undefined) => {
  vi.resetModules();
  vi.stubEnv('VITE_ALLOW_INSECURE_URLS', allowInsecure);
  return import('./insecure-urls');
};

describe('VITE_ALLOW_INSECURE_URLS', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('off (the default)', () => {
    it('requires https', async () => {
      const { ALLOWS_INSECURE_URLS, SECURE_URL_SCHEME } = await load(undefined);

      expect(ALLOWS_INSECURE_URLS).toBe(false);
      expect(SECURE_URL_SCHEME).toBe('https');
    });

    it('always puts the https prefix in front, an explicit http:// included', async () => {
      const { withUrlPrefix } = await load(undefined);

      expect(withUrlPrefix('https://', 'acme.com/pricing')).toBe('https://acme.com/pricing');
      // Unchanged behaviour: the result is not a valid page address, and is refused as such.
      expect(withUrlPrefix('https://', 'http://localhost:3000')).toBe('https://http://localhost:3000');
    });
  });

  describe('on, on a dev server', () => {
    it('accepts http where https was required', async () => {
      const { ALLOWS_INSECURE_URLS, SECURE_URL_SCHEME } = await load('true');

      expect(ALLOWS_INSECURE_URLS).toBe(true);
      expect(new RegExp(`^${SECURE_URL_SCHEME}://`).test('http://localhost:8180')).toBe(true);
      expect(new RegExp(`^${SECURE_URL_SCHEME}://`).test('https://acme.com')).toBe(true);
    });

    it('still adds https to a bare host, and keeps an explicit http://', async () => {
      const { withUrlPrefix } = await load('true');

      expect(withUrlPrefix('https://', 'acme.com')).toBe('https://acme.com');
      expect(withUrlPrefix('https://', 'http://test-site.e2e:8080/page')).toBe('http://test-site.e2e:8080/page');
      expect(withUrlPrefix('https://', 'HTTP://acme.test')).toBe('HTTP://acme.test');
    });

    it('leaves other prefixes alone', async () => {
      const { withUrlPrefix } = await load('true');

      expect(withUrlPrefix('mailto:', 'http://x')).toBe('mailto:http://x');
    });
  });

  it('is never honoured by a production build', async () => {
    vi.stubEnv('DEV', false);
    const { ALLOWS_INSECURE_URLS, withUrlPrefix } = await load('true');

    expect(ALLOWS_INSECURE_URLS).toBe(false);
    expect(withUrlPrefix('https://', 'http://acme.test')).toBe('https://http://acme.test');
  });
});
