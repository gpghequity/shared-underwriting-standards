// Generates public/bible.json — the single live Bible every app reads at runtime.
//
// Deterministic on purpose: no build timestamp, keys sorted. The file's bytes change
// ONLY when the underwriting numbers actually change. That is what makes the apps'
// "has the Bible changed since I last looked?" check meaningful — if it were stamped
// with a build time, every deploy would look like a Bible change and every app would
// re-download for nothing.
//
// Run: node build-bible-json.js   (also runs automatically via `npm run build`)

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STANDARDS = require('./index.js');

// Stable stringify — sort object keys recursively so byte output is reproducible.
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((acc, k) => {
      acc[k] = stable(value[k]);
      return acc;
    }, {});
  }
  return value;
}

const sorted = stable(STANDARDS);
const contentHash = crypto
  .createHash('sha256')
  .update(JSON.stringify(sorted))
  .digest('hex')
  .slice(0, 16);

// The served document. `bibleVersion` + `contentHash` let any app log exactly which
// Bible it used for a given deal.
const doc = {
  bibleVersion: (STANDARDS.META && STANDARDS.META.version) || 'unknown',
  contentHash,
  standards: sorted
};

const outDir = path.join(__dirname, 'public');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'bible.json');
fs.writeFileSync(outFile, JSON.stringify(doc, null, 2) + '\n', 'utf8');

console.log('wrote ' + outFile);
console.log('bibleVersion: ' + doc.bibleVersion);
console.log('contentHash:  ' + contentHash);
console.log('bytes:        ' + fs.statSync(outFile).size);
