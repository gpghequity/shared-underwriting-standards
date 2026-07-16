// THE BIBLE CLIENT — the one way every app reads the Bible.
//
// Rules this enforces, so no app has to be trusted to remember them:
//
//   1. NO APP STORES BIBLE NUMBERS. This client fetches them from the live Bible URL.
//   2. IT CHECKS EVERY TIME. Every call to getBible() asks the server "has the Bible
//      changed since I last looked?" using the ETag. If it hasn't, the server answers
//      304 with an empty body (a few bytes) and we reuse the in-memory copy. If it has,
//      we get the new one. Run a deal at 10:00 and again at 10:05 and both checked.
//   3. IT FAILS CLOSED. If the Bible cannot be reached, this THROWS. It does not fall
//      back to a bundled copy, a last-known-good value, or a default — because that is
//      drift, and drift is the thing we are eliminating. An app that cannot reach the
//      Bible must refuse to calculate rather than quietly use a stale number.
//
// The only tunable is `maxAgeMs`: within that window, repeated calls reuse the copy we
// already validated instead of re-asking. Default 0 = ask on literally every call.
// Set it to a few seconds only if a single deal makes many calls and the revalidation
// round-trip actually hurts.
//
// Works in browsers and in Node 18+ (both have fetch).

'use strict';

// The one canonical Bible URL. Must be the STABLE production alias — the
// deployment-specific URLs (…-kkl04ycfq-…vercel.app) are SSO-protected and
// return a redirect to a login page instead of the Bible.
const DEFAULT_BIBLE_URL = 'https://shared-underwriting-standards.vercel.app/bible.json';

class BibleUnavailableError extends Error {
  constructor(message, cause) {
    super(
      'BIBLE UNAVAILABLE — refusing to calculate. ' +
      message +
      ' | No fallback is used on purpose: a stale number is worse than no answer.'
    );
    this.name = 'BibleUnavailableError';
    this.cause = cause;
  }
}

function createBibleClient(options) {
  const opts = options || {};
  const url = opts.url || DEFAULT_BIBLE_URL;
  const maxAgeMs = typeof opts.maxAgeMs === 'number' ? opts.maxAgeMs : 0;
  const timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : 8000;
  const fetchImpl = opts.fetch || (typeof fetch !== 'undefined' ? fetch : null);

  if (!fetchImpl) {
    throw new Error('bible-client: no fetch available; pass options.fetch');
  }

  // In-memory only. Never written to disk/localStorage — a persisted copy would
  // outlive the process and become exactly the stale copy we are trying to kill.
  let cached = null;      // { doc, etag, validatedAt }
  let inFlight = null;    // de-dupe concurrent callers

  async function revalidate() {
    const headers = { Accept: 'application/json' };
    if (cached && cached.etag) headers['If-None-Match'] = cached.etag;

    let res;
    try {
      res = await fetchImpl(url, {
        method: 'GET',
        headers,
        cache: 'no-store', // we do our own validation via ETag
        signal: AbortSignal.timeout(timeoutMs)
      });
    } catch (e) {
      throw new BibleUnavailableError('Could not reach ' + url + ' (' + e.message + ').', e);
    }

    if (res.status === 304 && cached) {
      cached.validatedAt = Date.now();
      return cached.doc;
    }

    if (!res.ok) {
      throw new BibleUnavailableError(url + ' returned HTTP ' + res.status + '.');
    }

    let doc;
    try {
      doc = await res.json();
    } catch (e) {
      throw new BibleUnavailableError('Bible at ' + url + ' is not valid JSON.', e);
    }

    if (!doc || !doc.standards || typeof doc.standards !== 'object') {
      throw new BibleUnavailableError('Bible at ' + url + ' has no "standards" object.');
    }

    cached = {
      doc,
      etag: res.headers.get('ETag'),
      validatedAt: Date.now()
    };
    return doc;
  }

  // Returns the full served document: { bibleVersion, contentHash, standards }.
  async function getBibleDoc() {
    if (cached && maxAgeMs > 0 && Date.now() - cached.validatedAt < maxAgeMs) {
      return cached.doc;
    }
    if (inFlight) return inFlight;
    inFlight = revalidate().finally(() => { inFlight = null; });
    return inFlight;
  }

  // The standards object itself — what calculations use.
  async function getBible() {
    return (await getBibleDoc()).standards;
  }

  // Which Bible produced a given answer. Log this alongside deal output so any
  // number can be traced back to the exact Bible that generated it.
  function lastSeenVersion() {
    return cached ? { bibleVersion: cached.doc.bibleVersion, contentHash: cached.doc.contentHash } : null;
  }

  return { getBible, getBibleDoc, lastSeenVersion, url };
}

const defaultClient = createBibleClient();

module.exports = {
  createBibleClient,
  BibleUnavailableError,
  DEFAULT_BIBLE_URL,
  getBible: defaultClient.getBible,
  getBibleDoc: defaultClient.getBibleDoc,
  lastSeenVersion: defaultClient.lastSeenVersion
};
