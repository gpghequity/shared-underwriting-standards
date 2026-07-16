// bible-reader.js
// ============================================================================
// INSTRUCTION TO READ THE BIBLE — NOT a copy of it.
// ============================================================================
// This file holds ZERO underwriting numbers of its own. Every value it returns
// is projected live from the single canonical source of truth, ./index.js
// (PLATFORM_UNDERWRITING_STANDARDS). Change a number in the Bible (index.js) and
// it propagates here — and to every tool that reads here — with no code edits.
//
// Prior version of this file was a stale hardcoded COPY whose numbers had
// drifted from the Bible (pads 0.20/0.33 vs canonical 0.15/0.30, buyer-closing
// 0.04 vs 0.02, a divergent 8/22/45/80/130 rehab table, dead old-PC file path).
// That is fixed: the copy is gone; this now reads index.js.
//
// Fixed 2026-07-15 (bible-fix branch). API preserved: getBible / parseBible /
// readBibleFile so existing callers keep working unchanged.
// ============================================================================

const fs = require('fs');
const path = require('path');
const STANDARDS = require('./index.js'); // THE Bible (single source of truth)

// Legacy constants that existed in the OLD hardcoded bible-reader but have NO
// canonical field in index.js. We do NOT fabricate them — they resolve to null
// and are reported to Steve (QUESTIONS_FOR_STEVE) to either add to the Bible or
// confirm retired. Any caller relying on one gets `undefined`, surfacing the bug
// instead of silently using a non-canonical number.
// All legacy constants now have a canonical home in index.js (added 2026-07-16:
// REFI, GROWTH, GLOBAL.holdingMonthsDefault, RESIDENTIAL.ownerFinanceRate).
const NOT_IN_CANONICAL_BIBLE = [];

/**
 * readBibleFile()
 * Repaired from the old dead path (C:\Users\gpghe\Downloads\...). Looks for the
 * prose Bible export in a few known locations; returns its text if found. This
 * is informational only — getBible() does NOT depend on it (the machine-readable
 * Bible is index.js). Never throws fatally: a missing prose file must not break
 * the numbers.
 */
function readBibleFile() {
  const candidates = [
    path.join(__dirname, 'REI_MATH_BIBLE.md'),
    path.join(__dirname, '..', '..', 'Downloads', 'REI_MATH_BIBLE_full_export_2026-07-15.txt'),
    path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads', 'REI_MATH_BIBLE_full_export_2026-07-15.txt')
  ];
  for (const p of candidates) {
    try {
      if (p && fs.existsSync(p)) return fs.readFileSync(p, 'utf-8');
    } catch (_) { /* keep trying */ }
  }
  return null; // prose export not present on this machine; numbers still come from index.js
}

/**
 * parseBible()
 * Projects the canonical Bible (index.js) into the flat, legacy shape that
 * existing tools expect (GLOBAL / LENDING / REHAB / OFFER / CONFLICTS).
 * Every value below is a REFERENCE into STANDARDS — no literals.
 */
function parseBible() {
  const G = STANDARDS.GLOBAL;
  const R = STANDARDS.RESIDENTIAL;
  const S = STANDARDS.STORAGE;
  const C = STANDARDS.COMMERCIAL;
  const M = STANDARDS.MHP;
  const CC = STANDARDS.CLOSING_COSTS;
  const L = STANDARDS.LENDING;
  const RH = STANDARDS.REHAB;
  const T = STANDARDS.OFFER_TIERS_V9;

  return {
    GLOBAL: {
      // Bank financing by asset class — all read from the Bible
      RATE_BANK_STORAGE: S.mortgageRate,
      AMORT_BANK_STORAGE: S.amortizationYears,
      RATE_BANK_RESI: R.mortgageRate,
      AMORT_BANK_RESI: R.amortizationYears,
      RATE_BANK_COMMERCIAL: C.mortgageRate,
      AMORT_BANK_COMMERCIAL: C.amortizationYears,

      // Owner / seller financing
      RATE_OWNER: R.ownerFinanceRate,        // 0.08 (Bible home added 2026-07-16)
      RATE_SELLER: R.sellerFinance.interestRate,
      AMORT_SELLER: R.sellerFinance.amortizationYears,

      // Refinance takeout (Bible home added 2026-07-16)
      RATE_REFI: STANDARDS.REFI.mortgageRate,
      AMORT_REFI: STANDARDS.REFI.amortizationYears,

      // LTV by asset class
      LTV_STORAGE: S.ltv,
      LTV_RESI: R.ltv,
      LTV_COMMERCIAL: C.ltv,
      LTV_MHP: M.ltv,

      // DSCR
      DSCR_CONSERVATIVE: R.dscr,        // 1.25
      DSCR_STRETCH: S.dscr.stretch,     // 1.15

      // Expense handling
      STORAGE_EXPENSE_FLOOR: S.expenseFloor,
      EXPENSE_PAD_LIGHT: R.expensePads.light,     // 0.00
      EXPENSE_PAD_STANDARD: R.expensePads.standard, // 0.15  (was wrongly 0.20)
      EXPENSE_PAD_HARSH: R.expensePads.harsh,       // 0.30  (was wrongly 0.33)

      // Capital / floors / fees
      WORKING_CAPITAL_PCT: S.scenarios.groupA_v1_1_25.equityPercent, // 0.25
      POCKET_FLOOR: G.pocketCashFloor,
      WHOLESALE_FEE: G.wholesaleFeeAmount,

      // Closing / holding / selling
      CLOSING_RESI: G.closingCostsFlatAmount, // 2000  (was wrongly 3000)
      HOLDING_COST_PCT_MONTHLY: G.holdingCostPercentMonthly, // 0.01 (Bible models holding as %/mo, not flat)
      HOLDING_MONTHS: G.holdingMonthsDefault, // 6 (Bible home added 2026-07-16)
      SELLING_COSTS_PCT: G.sellingCostsPercent,

      // Comps / commission
      ARV_PERCENTILE: G.arvPercentile, // 0.40 (was represented as 40)
      COMMISSION_PCT: G.commissionDefaultPercent,
      COMMISSION_MIN: G.commissionMinimum,

      // Growth assumptions (Bible home added 2026-07-16)
      NOI_GROWTH_CONSERVATIVE: STANDARDS.GROWTH.noiConservative,
      NOI_GROWTH_STRETCH: STANDARDS.GROWTH.noiStretch,
      EXPENSE_GROWTH: STANDARDS.GROWTH.expenseAnnual,

      // Buyer-side closing (commercial-grade)
      buyerClosingCostsPct: CC.buyerClosingCostsPct, // 0.02 (was wrongly 0.04)
      sellingCostsPercent: G.sellingCostsPercent,
      arvMultiplier: R.arvMultiplier // 0.70
    },

    LENDING: {
      ltvByAssetType: L.ltvByAssetType,
      ltvByAssetTypeDefault: L.ltvByAssetTypeDefault,
      interestRate: L.interestRate,
      pointsPercent: L.pointsPercent,
      term: L.term,
      structures: {
        bank_only: 'Bank financing only',
        equity_8_io: 'Equity 8% interest-only',
        equity_8_amort_25yr: 'Equity 8% amortized 25yr',
        buyer_seller_finance: '$100k buyer + seller finance 5%/25yr'
      },
      dscr_tiers: [R.dscr, S.dscr.stretch] // [1.25, 1.15]
    },

    REHAB: {
      // All rehab pricing is the Bible's line-item system (index.js REHAB).
      condition_tiers: RH.tiers,
      systems: RH.systems,
      // Effective cosmetic $/SF for verification (Bible §5.4): $15/SF base × tier
      effectiveCosmetic_PSF: R.effectiveCosmetic_PSF,
      holding: RH.systems.holding
      // NOTE: the old divergent quick tables ($5/25/45/75/110 and 8/22/45/80/130)
      // are intentionally REMOVED. Bible line-item math is canonical (Steve Q2).
    },

    OFFER: {
      // Three-tier offer structure — read from the Bible
      tiers: {
        retail: {
          label: 'Retail',
          description: 'List on the market, most money, slowest',
          formula_residential: 'ARV × 100% − rehab',
          formula_income: 'highest Bible value − rehab'
        },
        direct_investor: {
          label: 'Direct Investor',
          description: 'Sell straight to us, faster close',
          flat_fee: T.flipper_fee,       // 10000
          pct_fee: T.flipper_pct,         // 0.05
          min_threshold: T.small_deal     // 30000
        },
        fastest_cash: {
          label: 'Fastest Cash Closing',
          description: 'As-is, fastest close',
          flat_fee: T.fast_cash_fee,      // 20000
          pct_fee: T.fast_cash_pct,       // 0.10
          min_threshold: T.small_deal     // 30000
        }
      },
      output_disclaimer: 'Estimates, accurate to about ±10%. Based on the data we have so far — numbers may change as we collect more.'
    },

    // Metadata so callers can confirm they are reading canonical, not a copy
    _meta: {
      source: 'shared-underwriting-standards/index.js',
      bibleVersion: STANDARDS.META.bibleVersion,
      isLiveProjection: true,
      notInCanonicalBible: NOT_IN_CANONICAL_BIBLE
    }
  };
}

function getBible() {
  // Always read fresh from the Bible. No cache of numbers lives here.
  return parseBible();
}

module.exports = {
  getBible,
  readBibleFile,
  parseBible,
  NOT_IN_CANONICAL_BIBLE
};
