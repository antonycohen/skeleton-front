import type { z } from 'zod';

type AnyObjectSchema = z.ZodObject<z.ZodRawShape>;

/**
 * A full record of the schema's shape: every key present and `null` (read models are all-nullable),
 * then the overrides on top. Keeps fixtures short while still matching what the API sends.
 */
export function make<S extends AnyObjectSchema>(schema: S, overrides: Partial<z.infer<S>> = {}): z.infer<S> {
  const empty = Object.fromEntries(Object.keys(schema.shape).map((key) => [key, null]));
  return { ...empty, ...overrides } as z.infer<S>;
}

/** Deterministic UUIDs, readable in the network panel: `uuid(3)` → `00000000-0000-4000-8000-000000000003`. */
export const uuid = (n: number, prefix = '00000000') =>
  `${prefix}-0000-4000-8000-${String(n).padStart(12, '0')}`;

/** ISO date `days` before a fixed "today", so stories never drift with the calendar. */
export const STORYBOOK_NOW = new Date('2026-10-07T09:00:00Z');
export const daysAgo = (days: number) => new Date(STORYBOOK_NOW.getTime() - days * 86_400_000).toISOString();
export const daysFromNow = (days: number) => daysAgo(-days);
