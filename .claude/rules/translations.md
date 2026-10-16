---
paths:
  - "packages/web-*/src/**"
  - "packages/core-api-models/src/**"
  - "packages/core-translations/src/**"
  - "apps/skeleton-app/src/**"
  - "apps/skeleton-bo-app/src/**"
---

# Translations

All UI text is translated with `@skeleton/core-translations` (react-intl). Locales: `en` and `fr`. References: `web-feature-organizations/src/lib/pages/edit-organization-manager-page/edit-organization-manager-page.tsx`, `packages/core-translations/src/lib/translations/`.

## Every user-visible string goes through `t()`

- Titles, descriptions, labels, placeholders, buttons, column headers, row actions, breadcrumbs, tab titles, navigation items, toasts, empty states, modal texts, `aria-label`s — no hardcoded English in JSX or in config arrays.
- `const { t, tNode, tIfKey } = useTranslation();` at the top of the component or hook. Module-level helpers (e.g. `getTabItems`) take `t: TFunction` as a parameter.
- Pass a **literal key** (`t('serviceAccounts.list.title')`), never a computed one (`t(\`status.${x}\`)`): `scripts/check-translations.mjs` finds keys by scanning literals. Map dynamic values to literal keys with a `Record<…, string>` of keys.
- Interpolate with ICU placeholders: `t('teams.invite.sent', { email })` ↔ `"Invitation sent to {email}"`. Plurals use ICU `{count, plural, one {…} other {…}}`.
- `tNode` for rich text (`<b>…</b>`, `<li>…</li>`, or your own tags passed as options); `tIfKey` for a value that may be a key or a raw server message.

## Catalogs

- Files: `packages/core-translations/src/lib/translations/<locale>/<namespace>.json`. One namespace per feature/area (`common`, `layout`, `login`, `billing`, `dashboard`, `validation`, …). A new namespace = one new file per locale; they are merged automatically (`import.meta.glob`).
- Keys are **flat** and **prefixed by their namespace**: `"serviceAccounts.list.title": "Service accounts"` lives in `serviceAccounts.json`.
- Add every key to **both** `en` and `fr`, in the same file name, with a real French translation (not a copy of the English).
- Reuse `common.*` for generic words (`common.save`, `common.cancel`, `common.delete`, `common.actions`, `common.loading`, …) instead of creating feature duplicates.
- Never edit one locale without the other.

## Validation messages

- Zod messages in `core-api-models` (and form schemas) are `validation.*` keys, not English: `z.email('validation.common.invalidEmail')`, `.min(1, 'validation.common.nameRequired')`.
- `FieldError` translates them via `tIfKey`, so server field errors (`parametersErrors`, already human text) still display as is.
- Add new `validation.*` keys to `validation.json` in both locales.

## Locale

- Resolution: stored choice (`localStorage` `skeleton-locale`) → browser language → `en`. Apps call `useSyncLanguage(connectedUser.localizationPreferences.language)` so the user's saved preference wins.
- Format dates and numbers with the active locale (`intl` from `useTranslation()`, or `Intl.*` with that locale) rather than a hardcoded one.
- Without a `TranslationProvider` (unit tests rendering a component alone) `useTranslation` falls back to English — tests can assert on English text.

## Check

Run `node scripts/check-translations.mjs` after adding or changing keys: it fails on keys used in code but missing from the catalogs, and on keys present in one locale but not the other.
