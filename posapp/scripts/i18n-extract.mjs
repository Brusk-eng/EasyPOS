// Rebuilds src/i18n/locales/en.json from every `t("...")` / `i18n.t("...")`
// call in src/, and reports keys the other catalogs are missing (or no longer
// use). Keys are the English source strings (see src/i18n/index.js).
//
//   yarn i18n:extract          rewrite en.json, prune stale keys from others, report gaps
//   yarn i18n:extract --check  exit 1 if any catalog is missing a key (CI)
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");
const localesDir = join(srcDir, "i18n", "locales");
const check = process.argv.includes("--check");

const walk = (dir) =>
	readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return walk(path);
		return /\.(jsx?|tsx?)$/.test(name) ? [path] : [];
	});

// t("..."), t('...'), _t("...") (src/i18n's key marker), and placeholder-free t(`...`) — a template literal with
// ${} can't be a stable key; use t("... {{name}} ...", { name }) instead.
const CALL = /(?<![\w$.])(?:i18n\.|_)?t\(\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|`((?:\\.|[^`\\$])*)`)/g;
const unescape = (s) => JSON.parse(`"${s.replace(/\\'/g, "'").replace(/\\`/g, "`").replace(/(?<!\\)"/g, '\\"')}"`);

const keys = new Set();
for (const file of walk(srcDir)) {
	// Comments often mention t("...") as documentation — don't harvest those.
	const code = readFileSync(file, "utf8")
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/^\s*\/\/.*$/gm, "")
		.replace(/\s\/\/\s.*$/gm, "");
	for (const m of code.matchAll(CALL)) keys.add(unescape(m[1] ?? m[2] ?? m[3]));
}
const sorted = [...keys].sort((a, b) => a.localeCompare(b));

let missingTotal = 0;
for (const file of readdirSync(localesDir).filter((f) => f.endsWith(".json"))) {
	const path = join(localesDir, file);
	const lang = file.replace(/\.json$/, "");
	const existing = JSON.parse(readFileSync(path, "utf8"));
	const missing = sorted.filter((k) => lang !== "en" && !existing[k]);
	const stale = Object.keys(existing).filter((k) => !keys.has(k));
	missingTotal += missing.length;

	if (!check) {
		const next = Object.fromEntries(
			sorted.filter((k) => lang === "en" || existing[k]).map((k) => [k, lang === "en" ? k : existing[k]]),
		);
		writeFileSync(path, `${JSON.stringify(next, null, "\t")}\n`);
	}
	console.log(`${lang}: ${sorted.length} keys, ${missing.length} missing, ${stale.length} stale${check ? "" : " (pruned)"}`);
	if (missing.length) console.log(missing.map((k) => `  - ${JSON.stringify(k)}`).join("\n"));
}

if (check && missingTotal) process.exit(1);
