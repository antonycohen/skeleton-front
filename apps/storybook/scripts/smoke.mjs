#!/usr/bin/env node
/**
 * Renders stories headlessly against a running Storybook and reports the ones that break:
 * render errors, uncaught exceptions, console errors, and API calls no handler mocked.
 *
 *   node apps/storybook/scripts/smoke.mjs [id-prefix…] [--url=http://localhost:6006] [--wait=2500]
 *
 * e.g. `node apps/storybook/scripts/smoke.mjs screens-campaigns components-ui-button`.
 * Exits 1 when a story fails.
 */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const option = (name, fallback) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=') ?? fallback;
const base = option('url', 'http://localhost:6006');
const settle = Number(option('wait', '2500'));
const prefixes = args.filter((a) => !a.startsWith('--'));
const concurrency = Number(option('concurrency', '4'));

const index = await fetch(`${base}/index.json`).then((r) => r.json());
const stories = Object.values(index.entries).filter(
  (e) => e.type === 'story' && (prefixes.length === 0 || prefixes.some((p) => e.id.startsWith(p))),
);
if (stories.length === 0) {
  console.error(`No story matches ${prefixes.join(', ') || '(all)'}`);
  process.exit(1);
}

const browser = await chromium.launch();
const failures = [];
const notes = [];

async function check(story) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const problems = [];
  const fallbacks = new Set();
  page.on('pageerror', (e) => problems.push(`uncaught: ${e.message.split('\n')[0]}`));
  page.on('console', (m) => {
    const text = m.text();
    if (text.startsWith('[storybook-msw] no handler')) fallbacks.add(text.replace(/^.*no handler for /, '').replace(/, answered.*$/, ''));
    else if (m.type() === 'error' && !/Download the React DevTools|\[vite\]|favicon|Failed to load resource/.test(text)) problems.push(`console.error: ${text.split('\n')[0].slice(0, 300)}`);
  });
  try {
    await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForFunction(
      () => document.body.classList.contains('sb-show-main') || document.body.classList.contains('sb-show-errordisplay'),
      undefined,
      { timeout: 60_000 },
    );
    await page.waitForTimeout(settle);
    if (await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay'))) {
      const message = await page.evaluate(() => document.querySelector('#error-message')?.textContent ?? '');
      problems.unshift(`render error: ${message.trim().split('\n')[0]}`);
    } else if (await page.evaluate(() => (document.getElementById('storybook-root')?.innerText ?? '').trim() === '' && !document.querySelector('#storybook-root *'))) {
      problems.push('rendered nothing');
    }
  } catch (e) {
    problems.push(`timeout/navigation: ${e.message.split('\n')[0]}`);
  }
  await page.close();
  const label = `${story.title} › ${story.name}`;
  if (problems.length) failures.push({ label, id: story.id, problems });
  if (fallbacks.size) notes.push({ label, fallbacks: [...fallbacks] });
  process.stdout.write(problems.length ? 'F' : '.');
}

const queue = [...stories];
await Promise.all(Array.from({ length: concurrency }, async () => { while (queue.length) await check(queue.shift()); }));
await browser.close();

console.log(`\n\n${stories.length - failures.length}/${stories.length} stories render cleanly.`);
for (const f of failures) console.log(`\n✗ ${f.label}  (${f.id})\n  ${[...new Set(f.problems)].join('\n  ')}`);
if (notes.length) {
  console.log('\nAPI calls answered by the fallback (consider a real handler):');
  for (const n of notes) console.log(`  ${n.label}: ${n.fallbacks.join(', ')}`);
}
process.exit(failures.length ? 1 : 0);
