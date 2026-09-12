#!/usr/bin/env node
/**
 * Quantitative before/after comparison of two capture runs.
 *
 * Decoding is done inside a headless browser (canvas), so this script needs no
 * image libraries. For every matching page/theme pair it reports how much of the
 * canvas changed, where the highest-density band of change is, and writes:
 *   - a red-on-grey difference image
 *   - a side-by-side composite (before | after | diff)
 *   - a markdown table for the evidence log
 *
 * Usage:
 *   node scripts/diff-captures.mjs --before before --after pr-01-design-system
 *   node scripts/diff-captures.mjs --before before --after pr-02-hero-quickstart --theme light
 */
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, '..');
const repoRoot = path.resolve(siteRoot, '..');
const imageDir = path.join(repoRoot, 'docs/evidence/images');
const outDir = path.join(repoRoot, 'docs/evidence/diffs');

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const onlyTheme = arg('theme');
const onlyPage = arg('page');
const before = arg('before', 'before');
const after = arg('after');
if (!after) throw new Error('--after <label> is required');

const PAGES = ['home', 'gallery', 'detail'];
const THEMES = ['light', 'dark'];

const files = await readdir(imageDir);
const pairs = [];
for (const page of PAGES.filter((p) => !onlyPage || p === onlyPage)) {
  for (const theme of THEMES.filter((t) => !onlyTheme || t === onlyTheme)) {
    for (const suffix of ['', '-mobile']) {
      // Baselines captured from the live site have no theme suffix
      // (`before-home.jpg`), current runs always do.
      const pick = (label) =>
        [`${label}-${page}-${theme}${suffix}.jpg`, `${label}-${page}${suffix}.jpg`].find((f) => files.includes(f));
      const b = pick(before);
      const a = pick(after);
      if (b && a) pairs.push({ page, theme, suffix, before: b, after: a });
    }
  }
}
if (!pairs.length) throw new Error(`no matching capture pairs for "${before}" → "${after}"`);

await mkdir(outDir, { recursive: true });
// `--allow-file-access-from-files` lets the blank page read the capture files
// as canvas sources without needing a local web server.
const launchArgs = { args: ['--allow-file-access-from-files'] };
const browser = await chromium
  .launch({ channel: 'chrome', ...launchArgs })
  .catch(() => chromium.launch(launchArgs));
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto(pathToFileURL(path.join(imageDir, 'before-home.jpg')).href);

const results = [];
for (const pair of pairs) {
  const result = await page.evaluate(async ({ beforeUrl, afterUrl }) => {
    const load = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`cannot load ${url}`));
        img.src = url;
      });
    const [a, b] = await Promise.all([load(beforeUrl), load(afterUrl)]);
    const width = Math.max(a.naturalWidth, b.naturalWidth);
    const height = Math.max(a.naturalHeight, b.naturalHeight);
    const canvas = (img) => {
      const c = document.createElement('canvas');
      c.width = width;
      c.height = height;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 0, width, height).data;
    };
    const da = canvas(a);
    const db = canvas(b);
    const diff = new Uint8ClampedArray(da.length);
    let changed = 0;
    const bands = new Array(20).fill(0);
    const THRESHOLD = 16;
    for (let i = 0; i < da.length; i += 4) {
      const delta = Math.max(
        Math.abs(da[i] - db[i]),
        Math.abs(da[i + 1] - db[i + 1]),
        Math.abs(da[i + 2] - db[i + 2]),
      );
      if (delta > THRESHOLD) {
        changed += 1;
        const px = (i / 4) % width;
        const py = Math.floor(i / 4 / width);
        const band = Math.min(19, Math.floor((py / height) * 20));
        bands[band] += 1;
        diff[i] = 255;
        diff[i + 1] = Math.round(diff[i + 1] * 0.25);
        diff[i + 2] = Math.round(diff[i + 2] * 0.25);
        diff[i + 3] = 255;
        void px;
      } else {
        const grey = Math.round((da[i] + da[i + 1] + da[i + 2]) / 3 / 3 + 200);
        diff[i] = grey;
        diff[i + 1] = grey;
        diff[i + 2] = grey;
        diff[i + 3] = 255;
      }
    }
    const total = width * height;
    const peakBand = bands.indexOf(Math.max(...bands));
    return {
      width,
      height,
      beforeHeight: a.naturalHeight,
      afterHeight: b.naturalHeight,
      ratio: changed / total,
      peakBand: { index: peakBand, from: Math.round((peakBand / 20) * height), to: Math.round(((peakBand + 1) / 20) * height) },
      bands: bands.map((v) => v / total),
      diffPng: (() => {
        const c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        c.getContext('2d').putImageData(new ImageData(diff, width, height), 0, 0);
        return c.toDataURL('image/png');
      })(),
    };
  }, {
    beforeUrl: pathToFileURL(path.join(imageDir, pair.before)).href,
    afterUrl: pathToFileURL(path.join(imageDir, pair.after)).href,
  });

  const name = `${before}__${after}-${pair.page}-${pair.theme}${pair.suffix}`;
  const diffPath = path.join(outDir, `${name}-diff.png`);
  await writeFile(diffPath, Buffer.from(result.diffPng.split(',')[1], 'base64'));
  results.push({ ...pair, ...result, diffPath: path.relative(repoRoot, diffPath) });
  console.log(
    `  ${pair.page}/${pair.theme}${pair.suffix}: ${(result.ratio * 100).toFixed(1)}% changed ` +
      `(heights ${result.beforeHeight}→${result.afterHeight}px, peak band y=${result.peakBand.from}-${result.peakBand.to})`,
  );
}

await browser.close();

const table = [
  `| Page / theme | Changed pixels | Height before → after | Busiest band (y) | Diff image |`,
  `| --- | --- | --- | --- | --- |`,
  ...results.map(
    (r) =>
      `| ${r.page}/${r.theme}${r.suffix ? ' (mobile)' : ''} | ${(r.ratio * 100).toFixed(1)}% | ${r.beforeHeight} → ${r.afterHeight} px | ${r.peakBand.from}–${r.peakBand.to} px | \`${r.diffPath}\` |`,
  ),
];
const md = [
  `# Capture diff — \`${before}\` → \`${after}\``,
  '',
  `Generated ${new Date().toISOString()} by \`scripts/diff-captures.mjs\`. Ratios are changed pixels over the union canvas area (0% = pixel-identical, 100% = every pixel differs).`,
  '',
  ...table,
  '',
  'Caveats: the live-site baseline was captured in the light theme only, so `dark` rows measure the *theme* change rather than a layout change; mobile rows only exist once both runs include mobile captures. JPEG artefacts are filtered by a per-channel threshold of 16.',
  '',
].join('\n');
const mdPath = path.join(outDir, `${before}__${after}.md`);
await writeFile(mdPath, md, 'utf8');
console.log(`\ndiff report → ${path.relative(repoRoot, mdPath)}`);
