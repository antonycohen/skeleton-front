#!/usr/bin/env node
/**
 * Checks the translation catalogs:
 *  - every locale has exactly the same keys;
 *  - every key used through t('…') / tNode('…') / tIfKey('…') / i18nKey: '…' in the code exists.
 *
 * Usage: node scripts/check-translations.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const translationsDir = join(root, 'packages/core-translations/src/lib/translations');

const locales = readdirSync(translationsDir).filter((entry) =>
  statSync(join(translationsDir, entry)).isDirectory(),
);

const catalogs = Object.fromEntries(
  locales.map((locale) => {
    const dir = join(translationsDir, locale);
    const keys = {};
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      const content = JSON.parse(readFileSync(join(dir, file), 'utf8'));
      for (const key of Object.keys(content)) {
        if (keys[key]) console.error(`✖ ${locale}: duplicate key ${key} (${file} and ${keys[key]})`);
        keys[key] = file;
      }
    }
    return [locale, keys];
  }),
);

let errors = 0;
const [reference, ...others] = locales;
for (const locale of others) {
  for (const key of Object.keys(catalogs[reference])) {
    if (!catalogs[locale][key]) {
      console.error(`✖ ${locale}: missing key ${key}`);
      errors++;
    }
  }
  for (const key of Object.keys(catalogs[locale])) {
    if (!catalogs[reference][key]) {
      console.error(`✖ ${reference}: missing key ${key} (present in ${locale})`);
      errors++;
    }
  }
}

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (['node_modules', 'dist', 'out-tsc'].includes(entry)) return [];
    if (statSync(path).isDirectory()) return walk(path);
    return /\.(ts|tsx)$/.test(entry) && !/\.(spec|test)\.tsx?$/.test(entry) ? [path] : [];
  });

const usage = /\b(?:t|tNode|tIfKey)\(\s*['"`]([a-zA-Z0-9_.-]+)['"`]|i18nKey:\s*['"`]([a-zA-Z0-9_.-]+)['"`]/g;
for (const file of [...walk(join(root, 'packages')), ...walk(join(root, 'apps'))]) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(usage)) {
    const key = match[1] ?? match[2];
    if (!catalogs[reference][key]) {
      console.error(`✖ ${relative(root, file)}: unknown key ${key}`);
      errors++;
    }
  }
}

if (errors) {
  console.error(`\n${errors} translation problem(s).`);
  process.exit(1);
}
console.log(`✔ ${Object.keys(catalogs[reference]).length} keys, ${locales.length} locales in sync.`);
