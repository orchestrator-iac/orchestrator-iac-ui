/* eslint-env node */

/**
 * Build-time sitemap generator.
 * Fetches all published templates from the backend API and writes
 * public/sitemap.xml so search engines can discover every page.
 *
 * Usage (called automatically by `npm run build`):
 *   node scripts/generate-sitemap.mjs
 *
 * Environment variables (optional — defaults to production values):
 *   VITE_API_BASE_URL   backend base URL  (e.g. https://landing-zone-orchestrator-backend.vercel.app/api/v1)
 *   VITE_SITE_URL       canonical frontend (e.g. https://orchestrator.next-zen.dev)
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_BASE = process.env.VITE_API_BASE_URL;

const SITE_BASE = process.env.VITE_SITE_URL;

const today = new Date().toISOString().slice(0, 10);

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `<url>
    <loc>${esc(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function lastmod(doc) {
  const raw = doc.updatedAt || doc.publishedAt || doc.createdAt || today;
  return String(raw).slice(0, 10);
}

async function fetchAllTemplates() {
  const templates = [];
  let page = 1;
  const size = 100;

  let hasMore = true;
  while (hasMore) {
    const url = `${API_BASE}/templates?page=${page}&size=${size}&sort=newest`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(
        `[sitemap] API returned ${res.status} — stopping pagination`,
      );
      hasMore = false;
      break;
    }
    const data = await res.json();
    const docs = data.templates || [];
    templates.push(...docs);

    const total = data.total ?? docs.length;
    const totalPages = Math.max(1, Math.ceil(total / size));
    if (page >= totalPages || docs.length === 0) {
      hasMore = false;
    } else {
      page += 1;
    }
  }

  return templates;
}

async function main() {
  console.log("[sitemap] Fetching templates from", API_BASE);

  const staticUrls = [
    urlEntry(`${SITE_BASE}/`, today, "weekly", "1.0"),
    urlEntry(`${SITE_BASE}/templates`, today, "daily", "0.9"),
  ];

  let templateUrls = [];
  try {
    const docs = await fetchAllTemplates();
    console.log(`[sitemap] Found ${docs.length} templates`);
    templateUrls = docs
      .map((doc) => {
        const id = doc.id || doc._id;
        if (!id) return null;
        return urlEntry(
          `${SITE_BASE}/templates/${id}`,
          lastmod(doc),
          "weekly",
          "0.8",
        );
      })
      .filter(Boolean);
  } catch (err) {
    console.warn("[sitemap] Failed to fetch templates:", err.message);
    console.warn("[sitemap] Writing static-only sitemap.");
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticUrls,
    ...templateUrls,
    "</urlset>",
  ].join("\n");

  const outDir = join(__dirname, "..", "public");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "sitemap.xml");
  writeFileSync(outPath, xml, "utf8");
  console.log(
    `[sitemap] Written ${1 + templateUrls.length + staticUrls.length - 1} URLs to ${outPath}`,
  );
}

try {
  await main();
} catch (err) {
  console.error("[sitemap] Fatal error:", err);
  process.exit(1);
}
