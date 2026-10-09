// Fails if messages/en.json and messages/es.json don't have identical key sets.
// Arrays (list items, table rows and cells) count by index, so their shapes must match too.
import { readFileSync } from "node:fs";

const load = (locale) => JSON.parse(readFileSync(`messages/${locale}.json`, "utf8"));
const keys = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

const en = new Set(keys(load("en")));
const es = new Set(keys(load("es")));
const onlyEn = [...en].filter((k) => !es.has(k));
const onlyEs = [...es].filter((k) => !en.has(k));

if (onlyEn.length || onlyEs.length) {
  if (onlyEn.length) console.error(`Missing in es.json:\n  ${onlyEn.join("\n  ")}`);
  if (onlyEs.length) console.error(`Missing in en.json:\n  ${onlyEs.join("\n  ")}`);
  process.exit(1);
}
console.log(`messages: ${en.size} keys, en and es match`);
