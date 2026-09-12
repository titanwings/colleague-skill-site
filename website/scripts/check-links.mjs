#!/usr/bin/env node
/**
 * Internal link + asset gate for the built site.
 *
 * Walks every HTML file in `dist/`, collects href/src attributes, and fails when
 * an internal target does not exist on disk (after accounting for the site base
 * path and directory-index resolution). External links are reported but do not
 * fail the build — network flakiness must not gate a PR.
 *
 * Usage: node scripts/check-links.mjs [--json out.json]
 */
import { readdir, readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, '..');
const repoRoot = path.resolve(siteRoot, '..');
const dist = path.join(siteRoot, 'dist');
const base = '/colleague-skill-site';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const jsonOut = arg('json', path.join(repoRoot, 'docs/evidence/link-report.json'));

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const exists = async (p) => {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
};

const files = await walk(dist);
const broken = [];
const external = new Set();
let checked = 0;

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const attrs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const raw of attrs) {
    if (!raw || raw.startsWith('#') || raw.startsWith('data:') || raw.startsWith('mailto:')) continue;
    if (/^https?:\/\//i.test(raw)) {
      external.add(raw);
      continue;
    }
    if (raw.startsWith('//')) continue;
    checked += 1;
    const withoutQuery = raw.split(/[?#]/)[0];
    let rel = withoutQuery;
    if (rel.startsWith(base)) rel = rel.slice(base.length);
    const target = path.join(dist, rel);
    const candidates = [target, `${target}.html`, path.join(target, 'index.html')];
    let ok = false;
    for (const c of candidates) {
      if (await exists(c)) {
        ok = true;
        break;
      }
    }
    if (!ok) broken.push({ page: path.relative(dist, file), href: raw });
  }
}

const report = {
  generated_at: new Date().toISOString(),
  pages: files.length,
  internal_checked: checked,
  external_hosts: [...new Set([...external].map((u) => { try { return new URL(u).host; } catch { return u; } }))].sort(),
  broken,
};
await mkdir(path.dirname(jsonOut), { recursive: true });
await writeFile(jsonOut, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`checked ${checked} internal links across ${files.length} pages; ${broken.length} broken`);
if (report.external_hosts.length) console.log(`external hosts referenced: ${report.external_hosts.join(', ')}`);
if (broken.length) {
  for (const b of broken.slice(0, 20)) console.error(`  BROKEN ${b.page} → ${b.href}`);
  process.exit(1);
}
