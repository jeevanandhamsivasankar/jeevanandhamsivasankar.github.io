/**
 * Media budget + manifest validation (US-204).
 * Usage: node scripts/check-media-budget.mjs [distDir=dist] [--manifest path]
 * Exit 1 on any violation.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve, basename, extname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const KB = 1024;
/** @type {{name:string, test:(rel:string)=>boolean, max:number}[]} */
export const BUDGETS = [
  { name: "portrait 600w AVIF", test: (f) => /profile-600[^/]*\.avif$/i.test(f), max: 35 * KB },
  { name: "OG JPEG", test: (f) => /og-card\.jpe?g$/i.test(f), max: 150 * KB },
  { name: "OG PNG", test: (f) => /og-card\.png$/i.test(f), max: 300 * KB },
  { name: "video", test: (f) => /\.(mp4|webm|mov)$/i.test(f), max: 4 * KB * KB },
  { name: "poster", test: (f) => /poster[^/]*\.(webp|avif|jpe?g|png)$/i.test(f), max: 60 * KB },
];

/** @param {string} dir @returns {string[]} files relative to dir, posix separators */
export function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(relative(dir, p).split("\\").join("/"));
    }
  };
  walk(dir);
  return out;
}

/** True if the image buffer carries EXIF (which includes any GPS) metadata. */
export function hasExif(buf, ext) {
  const e = ext.toLowerCase();
  if (e === ".jpg" || e === ".jpeg") return buf.includes(Buffer.from("Exif\0\0", "latin1"));
  if (e === ".png") return buf.includes(Buffer.from("eXIf", "latin1"));
  if (e === ".webp") return buf.includes(Buffer.from("EXIF", "latin1"));
  return false;
}

/** @returns {string[]} violation messages */
export function checkBudgets(dir) {
  const errors = [];
  for (const f of listFiles(dir)) {
    const size = statSync(join(dir, f)).size;
    for (const b of BUDGETS) {
      if (b.test(f) && size > b.max) errors.push(`${f}: ${b.name} ${size} B exceeds budget ${b.max} B`);
    }
  }
  return errors;
}

/** @returns {string[]} violation messages (placeholder files, EXIF/GPS metadata) */
export function checkClean(dir) {
  const errors = [];
  for (const f of listFiles(dir)) {
    if (/placeholder-/i.test(f)) errors.push(`${f}: placeholder asset in build (FR-MEDIA-009)`);
    const ext = extname(f);
    if (/^\.(jpe?g|png|webp)$/i.test(ext) && hasExif(readFileSync(join(dir, f)), ext)) {
      errors.push(`${f}: contains EXIF/GPS metadata (NFR-MEDIA-005)`);
    }
  }
  return errors;
}

/** @param {Array<object>} items media manifest entries @returns {string[]} */
export function validateManifest(items) {
  const errors = [];
  (items ?? []).forEach((it, i) => {
    const id = it?.id ?? `#${i}`;
    if (it?.rightsConfirmed !== true) errors.push(`media ${id}: rightsConfirmed must be true`);
    for (const k of ["alt", "description"]) {
      if (typeof it?.[k] !== "string" || !it[k].trim()) errors.push(`media ${id}: ${k} must be non-empty`);
    }
  });
  return errors;
}

async function loadManifest(path) {
  if (!existsSync(path)) return null;
  const mod = await import(pathToFileURL(resolve(path)).href);
  const v = mod.MEDIA ?? mod.media ?? mod.default;
  return Array.isArray(v) ? v : Object.values(v ?? {});
}

async function main() {
  const args = process.argv.slice(2);
  const mi = args.indexOf("--manifest");
  const manifestPath = mi >= 0 ? args.splice(mi, 2)[1] : "src/data/media.js";
  const dir = args[0] ?? "dist";
  if (!existsSync(dir)) {
    console.error(`check-media: ${dir} not found (run npm run build first)`);
    process.exit(1);
  }
  const errors = [...checkBudgets(dir), ...checkClean(dir)];
  const manifest = await loadManifest(manifestPath);
  if (manifest) errors.push(...validateManifest(manifest));
  if (errors.length) {
    errors.forEach((e) => console.error(`FAIL ${e}`));
    process.exit(1);
  }
  console.log(`check-media: OK (${listFiles(dir).length} files in ${basename(dir)}${manifest ? `, ${manifest.length} manifest entries` : ""})`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
