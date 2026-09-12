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
import { mkdir, writeFile } from 'node:fs/promises';
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
const origin = `http://127.0.0.1:${port}`;
const serve = !has('no-serve');
const failOnAll = has('all');
const jsonOut = arg('json', path.join(repoRoot, 'docs/evidence/a11y-report.json'));

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'gallery', path: '/gallery/' },
  { name: 'detail', path: '/gallery/boss-skill/' },
];
const THEMES = ['light', 'dark'];
const FAIL_IMPACTS = failOnAll ? ['serious', 'critical', 'moderate', 'minor'] : ['serious', 'critical'];

function startPreview() {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['astro', 'preview', '--port', String(port), '--host', '127.0.0.1'], {
      cwd: siteRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const timer = setTimeout(() => reject(new Error('astro preview did not start in 60s')), 60_000);
    const onData = (buf) => {
      const text = String(buf);
      if (text.includes(String(port)) || /localhost|ready|serving/i.test(text)) {
        clearTimeout(timer);
        setTimeout(() => resolve(child), 600);
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`astro preview exited early with code ${code}`));
    });
  });
}

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server never became ready: ${url}`);
}

let server;
if (serve) {
  server = await startPreview();
  await waitForServer(`${origin}${base}/`);
}

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const report = { base, generated_at: new Date().toISOString(), fail_impacts: FAIL_IMPACTS, pages: [], failures: [] };

for (const page of PAGES) {
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

await mkdir(path.dirname(jsonOut), { recursive: true });
await writeFile(jsonOut, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`a11y report → ${path.relative(repoRoot, jsonOut)}`);
if (report.failures.length) {
  console.error(`FAIL: ${report.failures.length} page/theme combination(s) with ${FAIL_IMPACTS.join('/')} violations`);
  process.exit(1);
}
console.log('a11y gate passed');
