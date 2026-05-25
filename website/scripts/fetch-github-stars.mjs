#!/usr/bin/env node
/**
 * Fetch GitHub star counts for every skill that has a `skill_repo` field.
 *
 * Reads all YAML files under src/content/skills/, extracts skill_repo URLs,
 * calls the GitHub API to get stargazers_count, and writes the result to
 * src/data/github-stars.json.
 *
 * Behavior:
 *   - Uses GITHUB_TOKEN env var if present (raises API limit from 60/hr to 5000/hr).
 *   - Skips skills without a skill_repo or with unparseable URLs.
 *   - On per-repo API failure (404, 403, rate-limit, network), keeps the previous
 *     cached value if one exists; otherwise drops the entry. Never throws.
 *   - Writes the file even if nothing changed (for deterministic mtime in CI).
 *
 * Run:
 *   node scripts/fetch-github-stars.mjs
 *   GITHUB_TOKEN=ghp_... node scripts/fetch-github-stars.mjs
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SKILLS_DIR = join(ROOT, "src", "content", "skills");
const OUTPUT_PATH = join(ROOT, "src", "data", "github-stars.json");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_URL_RE = /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+?)(?:\.git)?\/?$/i;

function log(...args) {
  console.log("[fetch-stars]", ...args);
}

function warn(...args) {
  console.warn("[fetch-stars]", ...args);
}

/** Parse skill_repo out of a YAML file using a single regex (avoids yaml dep). */
function extractRepoUrl(yamlText) {
  const m = yamlText.match(/^\s*skill_repo:\s*["']?([^"'\n]+?)["']?\s*$/m);
  if (!m) return null;
  const url = m[1].trim();
  if (!url) return null;
  const repoMatch = url.match(REPO_URL_RE);
  if (!repoMatch) return null;
  return `${repoMatch[1]}/${repoMatch[2]}`;
}

async function listSkillRepos() {
  const files = await readdir(SKILLS_DIR);
  const repos = [];
  for (const name of files) {
    if (!name.endsWith(".yaml") || name.startsWith("_")) continue;
    const text = await readFile(join(SKILLS_DIR, name), "utf8");
    const slug = name.replace(/\.yaml$/, "");
    const repo = extractRepoUrl(text);
    if (repo) {
      repos.push({ slug, repo });
    }
  }
  return repos;
}

async function loadExistingCache() {
  if (!existsSync(OUTPUT_PATH)) return {};
  try {
    const text = await readFile(OUTPUT_PATH, "utf8");
    return JSON.parse(text);
  } catch (err) {
    warn(`existing cache unreadable (${err.message}), starting fresh`);
    return {};
  }
}

async function fetchStars(ownerRepo) {
  const url = `https://api.github.com/repos/${ownerRepo}`;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "colleague-skill-site-star-sync",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;

  const resp = await fetch(url, { headers });
  if (resp.status === 404) {
    return { ok: false, reason: "not-found" };
  }
  if (resp.status === 403 || resp.status === 429) {
    const remaining = resp.headers.get("x-ratelimit-remaining");
    return { ok: false, reason: `rate-limited (remaining=${remaining})` };
  }
  if (!resp.ok) {
    return { ok: false, reason: `http-${resp.status}` };
  }
  const data = await resp.json();
  if (typeof data.stargazers_count !== "number") {
    return { ok: false, reason: "no-star-count-in-response" };
  }
  return { ok: true, stars: data.stargazers_count };
}

async function main() {
  log(`scanning ${SKILLS_DIR}`);
  const entries = await listSkillRepos();
  log(`found ${entries.length} skills with skill_repo`);
  if (GITHUB_TOKEN) {
    log("using GITHUB_TOKEN (authenticated, 5000/hr limit)");
  } else {
    log("no GITHUB_TOKEN set (unauthenticated, 60/hr limit)");
  }

  const previous = await loadExistingCache();
  const next = {};
  let fresh = 0;
  let kept = 0;
  let dropped = 0;

  for (const { slug, repo } of entries) {
    const result = await fetchStars(repo);
    if (result.ok) {
      next[repo] = {
        stars: result.stars,
        synced_at: new Date().toISOString(),
      };
      fresh++;
    } else if (previous[repo]) {
      next[repo] = previous[repo];
      kept++;
      warn(`${slug} (${repo}): ${result.reason} — keeping cached value`);
    } else {
      dropped++;
      warn(`${slug} (${repo}): ${result.reason} — no cached value, skipping`);
    }
  }

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  const sorted = {};
  for (const key of Object.keys(next).sort()) sorted[key] = next[key];
  await writeFile(OUTPUT_PATH, JSON.stringify(sorted, null, 2) + "\n", "utf8");

  log(`wrote ${OUTPUT_PATH}`);
  log(`fresh=${fresh} kept=${kept} dropped=${dropped} total=${Object.keys(next).length}`);
}

main().catch((err) => {
  console.error("[fetch-stars] fatal:", err);
  process.exit(1);
});
