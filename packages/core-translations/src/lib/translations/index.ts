/**
 * Messages are split in one JSON file per namespace and per locale:
 * `translations/<locale>/<namespace>.json`. Every file of a locale is merged
 * here, so adding a namespace only takes adding its files.
 *
 * Keys are flat and prefixed with their namespace (`teams.invite.title`).
 */
export const SUPPORTED_LOCALES = ['en', 'fr'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

const files = import.meta.glob<Record<string, string>>('./*/*.json', {
  eager: true,
  import: 'default',
});

export const messages = SUPPORTED_LOCALES.reduce(
  (acc, locale) => {
    acc[locale] = Object.entries(files)
      .filter(([path]) => path.startsWith(`./${locale}/`))
      .reduce((merged, [, content]) => ({ ...merged, ...content }), {});
    return acc;
  },
  {} as Record<SupportedLocale, Record<string, string>>,
);

export const isSupportedLocale = (locale: string | null | undefined): locale is SupportedLocale =>
  !!locale && (SUPPORTED_LOCALES as readonly string[]).includes(locale);
