#!/usr/bin/env node
/**
 * Accessibility gate.
 *
 * Runs axe-core (WCAG 2.2 A/AA + best practice rules) against every page in the
 * manifest, in both themes, and fails on any violation of impact
 * `serious` or `critical`.
 *
 * Usage:
 *   node scripts/check-a11y.mjs                  # serves dist/ itself
 *   node scripts/check-a11y.mjs --no-serve --port 4444
 *   node scripts/check-a11y.mjs --all            # also fail on moderate/minor
 *   node scripts/check-a11y.mjs --json out.json  # machine-readable report
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, '..');
const repoRoot = path.resolve(siteRoot, '..');

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const has = (name) => process.argv.includes(`--${name}`);

const base = arg('base', '/colleague-skill-site');
const port = Number(arg('port', '4322'));
const serve = !has('no-serve');
const failOnAll = has('all');
const sampleCount = Number(arg('sample', '0')) || 0;
const jsonOut = arg('json', path.join(repoRoot, 'docs/evidence/a11y-report.json'));

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'gallery', path: '/gallery/' },
  { name: 'detail', path: '/gallery/boss-skill/' },
];

/**
 * `--sample N` adds N deterministic detail pages (every k-th slug from dist/)
 * so catalog-wide regressions surface without running all 217 × 2 themes.
 */
async function sampledDetailPages(count) {
  if (!count) return [];
  const dir = path.join(siteRoot, 'dist', 'gallery');
  const slugs = (await readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  if (!slugs.length) return [];
  const step = Math.max(1, Math.floor(slugs.length / count));
  return slugs
    .filter((_, i) => i % step === 0)
    .slice(0, count)
    .map((slug) => ({ name: `detail:${slug}`, path: `/gallery/${slug}/` }));
}
const THEMES = ['light', 'dark'];
const FAIL_IMPACTS = failOnAll ? ['serious', 'critical', 'moderate', 'minor'] : ['serious', 'critical'];

/**
 * Start `astro preview` and prove it serves *this* build (same guard as
 * capture.mjs): a busy port makes astro move silently, and a peer worktree's
 * preview would answer on the same port, so we require our own marker file.
 */
function startPreview() {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['astro', 'preview', '--port', String(port), '--host', '127.0.0.1'], {
      cwd: siteRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let buffer = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`astro preview did not report a URL in 60s. Output:\n${buffer.slice(-800)}`));
    }, 60_000);
    const onData = (buf) => {
      buffer += String(buf);
      const match = buffer.match(/https?:\/\/(?:localhost|127\.0\.0\.1):(\d+)/);
      if (match) {
        clearTimeout(timer);
        resolve({ child, port: Number(match[1]) });
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`astro preview exited early with code ${code}. Output:\n${buffer.slice(-800)}`));
    });
  });
}

async function waitForMarker(url, expected, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok && (await res.text()) === expected) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server at ${url} never served this build's marker; pass --port <free port>.`);
}

let server;
let origin = `http://127.0.0.1:${port}`;
// Never leave an orphan preview behind: a crashed run used to keep the port
// bound and made the next run (or a peer worktree) fail confusingly.
const killServer = () => {
  if (server) {
    server.kill('SIGTERM');
    server = null;
  }
};
process.on('exit', killServer);
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    killServer();
    process.exit(signal === 'SIGINT' ? 130 : 143);
  });
}
let markerPath;
if (serve) {
  try {
    const probe = await fetch(`${origin}${base}/`, { cache: 'no-store' });
    if (probe.ok) throw new Error(`port ${port} is already serving a site; pass --port <free port>`);
  } catch (error) {
    if (String(error.message).includes('already serving')) throw error;
  }
  const markerName = `.a11y-marker-${process.pid}`;
  const markerValue = `a11y-${process.pid}-${Date.now()}`;
  markerPath = path.join(siteRoot, 'dist', markerName);
  await writeFile(markerPath, markerValue, 'utf8');
  const started = await startPreview();
  server = started.child;
  origin = `http://127.0.0.1:${started.port}`;
  await waitForMarker(`${origin}${base}/${markerName}`, markerValue);
}

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const report = { base, generated_at: new Date().toISOString(), fail_impacts: FAIL_IMPACTS, pages: [], failures: [] };

const pages = [...PAGES, ...(await sampledDetailPages(sampleCount))];

for (const page of pages) {
  for (const theme of THEMES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme });
    const tab = await ctx.newPage();
    await tab.goto(`${origin}${base}${page.path}`, { waitUntil: 'networkidle', timeout: 60_000 });
    await tab.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await tab.waitForTimeout(400);
    const results = await new AxeBuilder({ page: tab })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    const violations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 5).map((n) => n.target.join(' ')),
      count: v.nodes.length,
    }));
    const failing = violations.filter((v) => FAIL_IMPACTS.includes(v.impact ?? 'minor'));
    report.pages.push({ page: page.name, theme, url: `${base}${page.path}`, violations, failing: failing.length });
    if (failing.length) report.failures.push({ page: page.name, theme, violations: failing });
    const summary = violations.length
      ? violations.map((v) => `${v.id}(${v.impact ?? 'n/a'}×${v.count})`).join(', ')
      : 'clean';
    console.log(`  ${page.name}/${theme}: ${summary}`);
    await ctx.close();
  }
}

await browser.close();
if (server) {
  server.kill('SIGTERM');
  await new Promise((r) => setTimeout(r, 300));
}
if (markerPath) await rm(markerPath, { force: true });

await mkdir(path.dirname(jsonOut), { recursive: true });
await writeFile(jsonOut, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`a11y report → ${path.relative(repoRoot, jsonOut)}`);
if (report.failures.length) {
  console.error(`FAIL: ${report.failures.length} page/theme combination(s) with ${FAIL_IMPACTS.join('/')} violations`);
  process.exit(1);
}
console.log('a11y gate passed');
