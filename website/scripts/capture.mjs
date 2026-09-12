#!/usr/bin/env node
/**
 * Capture evidence screenshots of the built site.
 *
 * Usage:
 *   node scripts/capture.mjs --label pr-01 --base /colleague-skill-site
 *
 * Behaviour:
 *   - builds nothing: it serves `dist/` with `astro preview` (unless --no-serve)
 *   - captures every page in the manifest, both themes, desktop + mobile
 *   - records console errors, horizontal overflow and page height per capture
 *   - writes PNGs to ../../docs/evidence/images/<label>-<page>-<theme>.png
 *   - writes a JSON receipt to ../../docs/evidence/captures/<label>.json
 *
 * Exit code is non-zero when any capture had a console error, a page error or
 * horizontal overflow, so it can gate a PR.
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, '..');
const repoRoot = path.resolve(siteRoot, '..');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}
const has = (name) => process.argv.includes(`--${name}`);

const label = arg('label', 'capture');
const base = arg('base', '/colleague-skill-site');
const port = Number(arg('port', '4321'));
const outDir = path.resolve(arg('out', path.join(repoRoot, 'docs/evidence')));
const imageDir = path.join(outDir, 'images');
const receiptDir = path.join(outDir, 'captures');
const serve = !has('no-serve');
const only = arg('page'); // optional single page name

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'gallery', path: '/gallery/' },
  { name: 'detail', path: '/gallery/boss-skill/' },
];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, dsf: 1, fullPage: true },
  // Mobile is viewport-only: full-page mobile shots are multi-megabyte and add
  // little review value.
  { name: 'mobile', width: 390, height: 844, dsf: 2, fullPage: false },
];
const THEMES = ['light', 'dark'];

/**
 * Start `astro preview` and prove the server is serving *this* build.
 *
 * Two traps this avoids, both hit while several worktrees ran in parallel:
 *   1. a busy port makes astro silently pick another one, so we parse the URL it
 *      actually printed instead of assuming;
 *   2. a peer's preview server on the same port would happily answer, so we drop
 *      a unique marker file into our own `dist/` and require the server to serve
 *      it before any screenshot is taken.
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

/** Poll until the server answers with our own marker file. */
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
  throw new Error(
    `server at ${url} never served this build's marker. Another worktree's preview is probably on this port — pass --port <free port>.`,
  );
}

await mkdir(imageDir, { recursive: true });
await mkdir(receiptDir, { recursive: true });

let server;
let origin = `http://127.0.0.1:${port}`;
let markerPath;
if (serve) {
  // Refuse to guess: if something already answers on this port it is not ours.
  try {
    const probe = await fetch(`${origin}${base}/`, { cache: 'no-store' });
    if (probe.ok) {
      throw new Error(`port ${port} is already serving a site; pass --port <free port>`);
    }
  } catch (error) {
    if (String(error.message).includes('already serving')) throw error;
  }
  const markerName = `.capture-marker-${process.pid}`;
  const markerValue = `capture-${process.pid}-${Date.now()}`;
  markerPath = path.join(siteRoot, 'dist', markerName);
  await writeFile(markerPath, markerValue, 'utf8');
  const started = await startPreview();
  server = started.child;
  origin = `http://127.0.0.1:${started.port}`;
  await waitForMarker(`${origin}${base}/${markerName}`, markerValue);
  await waitForMarker(`${origin}${base}/${markerName}`, markerValue, 1);
}

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const receipt = { label, base, origin, generated_at: new Date().toISOString(), captures: [], failures: [] };

for (const page of PAGES.filter((p) => !only || p.name === only)) {
  for (const theme of THEMES) {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.dsf,
        colorScheme: theme,
        reducedMotion: 'reduce',
      });
      const tab = await ctx.newPage();
      const consoleErrors = [];
      tab.on('console', (m) => {
        if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
      });
      tab.on('pageerror', (e) => consoleErrors.push(`pageerror: ${String(e).slice(0, 300)}`));
      const url = `${origin}${base}${page.path}`;
      await tab.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
      await tab.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
      await tab.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await tab.waitForTimeout(700);
      const file = path.join(imageDir, `${label}-${page.name}-${theme}${vp.name === 'mobile' ? '-mobile' : ''}.jpg`);
      await tab.screenshot({ path: file, fullPage: vp.fullPage, type: 'jpeg', quality: 82 });
      const metrics = await tab.evaluate(() => {
        const el = document.documentElement;
        const contrast = getComputedStyle(document.body);
        return {
          title: document.title,
          height: document.body.scrollHeight,
          overflowX: el.scrollWidth > window.innerWidth + 1,
          bodyBackground: contrast.backgroundColor,
          bodyColor: contrast.color,
          sections: document.querySelectorAll('section').length,
          links: document.querySelectorAll('a').length,
        };
      });
      const entry = { page: page.name, theme, viewport: vp.name, url, file: path.relative(repoRoot, file), metrics, consoleErrors };
      if (consoleErrors.length || metrics.overflowX) receipt.failures.push(entry);
      receipt.captures.push(entry);
      await ctx.close();
    }
  }
}

await browser.close();
if (server) {
  server.kill('SIGTERM');
  await new Promise((r) => setTimeout(r, 300));
}
if (markerPath) await rm(markerPath, { force: true });

await writeFile(path.join(receiptDir, `${label}.json`), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
const summary = receipt.captures
  .map((c) => `  ${c.page}/${c.theme}/${c.viewport}: ${c.metrics.height}px${c.consoleErrors.length ? ` ERRORS=${c.consoleErrors.length}` : ''}${c.metrics.overflowX ? ' OVERFLOW-X' : ''}`)
  .join('\n');
console.log(`captured ${receipt.captures.length} screenshots for "${label}" → ${path.relative(repoRoot, imageDir)}`);
console.log(summary);
if (receipt.failures.length) {
  console.error(`FAIL: ${receipt.failures.length} capture(s) reported console errors or overflow`);
  process.exit(1);
}
