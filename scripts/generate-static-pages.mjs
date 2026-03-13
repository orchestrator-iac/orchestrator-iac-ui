/* eslint-env node */

/**
 * Post-build static page generator for SEO on GitHub Pages.
 *
 * GitHub Pages is a static file server. When Googlebot (or a user) navigates
 * directly to /templates or /templates/:id it looks for real files on disk.
 * Without them it returns HTTP 404 and the page is never indexed.
 *
 * This script runs after `vite build` and:
 *   1. Reads dist/index.html (the built SPA shell)
 *   2. Injects per-page <title>, <meta>, and canonical <link> tags
 *   3. Writes dist/templates/index.html and dist/templates/<id>/index.html
 *
 * GitHub Pages then serves HTTP 200 for every pre-generated route.
 * React still hydrates normally — the page works identically for users.
 *
 * No puppeteer, no headless browser, no new npm dependencies required.
 * Uses the same fetch-all-templates pattern as generate-sitemap.mjs.
 *
 * Environment variables (set via GitHub Actions secrets):
 *   VITE_API_BASE_URL   e.g. https://landing-zone-orchestrator-backend.vercel.app/api/v1
 *   VITE_SITE_URL       e.g. https://orchestrator.next-zen.dev
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");

const API_BASE = process.env.VITE_API_BASE_URL;
const SITE_BASE =
  process.env.VITE_SITE_URL || "https://orchestrator.next-zen.dev";

if (!API_BASE) {
  console.warn(
    "[static-pages] VITE_API_BASE_URL is not set — skipping template detail pages.",
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function esc(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Inject SEO tags into the SPA shell HTML.
 * Replaces the generic <title> and inserts <meta>/<link> tags before </head>.
 */
function buildHtml(baseHtml, { title, description, url, image }) {
  const tags = [
    `  <meta name="description" content="${esc(description)}">`,
    `  <meta name="robots" content="index, follow">`,
    `  <meta property="og:title" content="${esc(title)}">`,
    `  <meta property="og:description" content="${esc(description)}">`,
    `  <meta property="og:url" content="${esc(url)}">`,
    `  <meta property="og:type" content="website">`,
    image ? `  <meta property="og:image" content="${esc(image)}">` : "",
    `  <meta name="twitter:card" content="summary_large_image">`,
    `  <meta name="twitter:title" content="${esc(title)}">`,
    `  <meta name="twitter:description" content="${esc(description)}">`,
    `  <link rel="canonical" href="${esc(url)}">`,
  ]
    .filter(Boolean)
    .join("\n");

  return baseHtml
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace("</head>", `${tags}\n  </head>`);
}

function writeRoute(relPath, html) {
  const dir = join(distDir, relPath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf-8");
  console.log(`[static-pages] wrote dist/${relPath}/index.html`);
}

// ---------------------------------------------------------------------------
// Fetch all templates (same pagination pattern as generate-sitemap.mjs)
// ---------------------------------------------------------------------------

async function fetchAllTemplates() {
  const templates = [];
  let page = 1;
  const size = 100;

  let hasMore = true;

  while (hasMore) {
    const url = `${API_BASE}/templates?page=${page}&size=${size}&sort=newest`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[static-pages] API ${res.status} on page ${page} — stopping.`);
      break;
    }
    const data = await res.json();
    const docs = data.templates || [];
    templates.push(...docs);

    const total = data.total ?? docs.length;
    const totalPages = Math.max(1, Math.ceil(total / size));
    if (page >= totalPages || docs.length === 0) hasMore = false;
    else page += 1;
  }

  return templates;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const baseHtml = readFileSync(join(distDir, "index.html"), "utf-8");

  // 1. /templates  — gallery page
  writeRoute(
    "templates",
    buildHtml(baseHtml, {
      title: "Infrastructure Templates | Orchestrator",
      description:
        "Browse community infrastructure templates for AWS, Azure, and GCP. Deploy production-ready cloud architectures in one click.",
      url: `${SITE_BASE}/templates`,
      image: null,
    }),
  );

  // 2. /templates/:id — one page per published template
  if (!API_BASE) return;

  console.log("[static-pages] Fetching templates from", API_BASE);
  let templates = [];
  try {
    templates = await fetchAllTemplates();
    console.log(`[static-pages] Found ${templates.length} templates`);
  } catch (err) {
    console.warn("[static-pages] Failed to fetch templates:", err.message);
    console.warn("[static-pages] Skipping detail pages.");
    return;
  }

  for (const doc of templates) {
    const id = doc.id || doc._id;
    if (!id) continue;

    const title = `${doc.templateName || "Template"} | Orchestrator`;
    const rawDesc =
      doc.description ||
      `A ${(doc.cloud || "cloud").toUpperCase()} infrastructure template on Orchestrator.`;
    const description = rawDesc.slice(0, 160);
    const url = `${SITE_BASE}/templates/${id}`;

    writeRoute(
      `templates/${id}`,
      buildHtml(baseHtml, { title, description, url, image: doc.previewImage ?? null }),
    );
  }

  console.log("[static-pages] Done.");
}

main().catch((err) => {
  console.error("[static-pages] Fatal error:", err);
  process.exit(1);
});
