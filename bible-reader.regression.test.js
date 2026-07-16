// Regression test: bible-reader must be a live projection of index.js with
// ZERO divergent literals. Run: node bible-reader.regression.test.js
const STANDARDS = require('./index.js');
const { getBible } = require('./bible-reader.js');

const B = getBible();
let pass = 0, fail = 0;
const problems = [];
function eq(label, got, want) {
  if (got === want) { pass++; }
  else { fail++; problems.push(`FAIL ${label}: got ${got}, want ${want}`); }
}

// 1) Mapped values must EQUAL the canonical Bible (proves it reads, not copies)
eq('RATE_BANK_STORAGE', B.GLOBAL.RATE_BANK_STORAGE, STANDARDS.STORAGE.mortgageRate);
eq('AMORT_BANK_STORAGE', B.GLOBAL.AMORT_BANK_STORAGE, STANDARDS.STORAGE.amortizationYears);
eq('RATE_BANK_RESI', B.GLOBAL.RATE_BANK_RESI, STANDARDS.RESIDENTIAL.mortgageRate);
eq('AMORT_BANK_RESI', B.GLOBAL.AMORT_BANK_RESI, STANDARDS.RESIDENTIAL.amortizationYears);
eq('RATE_BANK_COMMERCIAL', B.GLOBAL.RATE_BANK_COMMERCIAL, STANDARDS.COMMERCIAL.mortgageRate);
eq('RATE_SELLER', B.GLOBAL.RATE_SELLER, STANDARDS.RESIDENTIAL.sellerFinance.interestRate);
eq('AMORT_SELLER', B.GLOBAL.AMORT_SELLER, STANDARDS.RESIDENTIAL.sellerFinance.amortizationYears);
eq('LTV_STORAGE', B.GLOBAL.LTV_STORAGE, STANDARDS.STORAGE.ltv);
eq('LTV_RESI', B.GLOBAL.LTV_RESI, STANDARDS.RESIDENTIAL.ltv);
eq('LTV_COMMERCIAL', B.GLOBAL.LTV_COMMERCIAL, STANDARDS.COMMERCIAL.ltv);
eq('LTV_MHP', B.GLOBAL.LTV_MHP, STANDARDS.MHP.ltv);
eq('DSCR_CONSERVATIVE', B.GLOBAL.DSCR_CONSERVATIVE, STANDARDS.RESIDENTIAL.dscr);
eq('DSCR_STRETCH', B.GLOBAL.DSCR_STRETCH, STANDARDS.STORAGE.dscr.stretch);
eq('STORAGE_EXPENSE_FLOOR', B.GLOBAL.STORAGE_EXPENSE_FLOOR, STANDARDS.STORAGE.expenseFloor);
eq('POCKET_FLOOR', B.GLOBAL.POCKET_FLOOR, STANDARDS.GLOBAL.pocketCashFloor);
eq('WHOLESALE_FEE', B.GLOBAL.WHOLESALE_FEE, STANDARDS.GLOBAL.wholesaleFeeAmount);
eq('SELLING_COSTS_PCT', B.GLOBAL.SELLING_COSTS_PCT, STANDARDS.GLOBAL.sellingCostsPercent);
eq('ARV_PERCENTILE', B.GLOBAL.ARV_PERCENTILE, STANDARDS.GLOBAL.arvPercentile);
eq('COMMISSION_PCT', B.GLOBAL.COMMISSION_PCT, STANDARDS.GLOBAL.commissionDefaultPercent);
eq('COMMISSION_MIN', B.GLOBAL.COMMISSION_MIN, STANDARDS.GLOBAL.commissionMinimum);
eq('arvMultiplier', B.GLOBAL.arvMultiplier, STANDARDS.RESIDENTIAL.arvMultiplier);

// 2) Previously-DIVERGENT values must now be the CORRECT canonical numbers
eq('EXPENSE_PAD_STANDARD is 0.15 (was 0.20)', B.GLOBAL.EXPENSE_PAD_STANDARD, 0.15);
eq('EXPENSE_PAD_HARSH is 0.30 (was 0.33)', B.GLOBAL.EXPENSE_PAD_HARSH, 0.30);
eq('buyerClosingCostsPct is 0.02 (was 0.04)', B.GLOBAL.buyerClosingCostsPct, 0.02);
eq('CLOSING_RESI is 2000 (was 3000)', B.GLOBAL.CLOSING_RESI, 2000);
eq('arvMultiplier is 0.70', B.GLOBAL.arvMultiplier, 0.70);

// 3) OFFER tiers read from Bible
eq('direct_investor flat_fee', B.OFFER.tiers.direct_investor.flat_fee, STANDARDS.OFFER_TIERS_V9.flipper_fee);
eq('fastest_cash flat_fee', B.OFFER.tiers.fastest_cash.flat_fee, STANDARDS.OFFER_TIERS_V9.fast_cash_fee);

// 4) REHAB reads Bible line-item; divergent quick tables must be GONE
eq('cosmetic base $/SF is Bible 15', B.REHAB.systems.cosmetic.baseCost, 15);
eq('studdedOut effective $/SF is 45 (NOT 110/130)', B.REHAB.effectiveCosmetic_PSF.studdedOut, 45);
eq('no national_benchmark 130 table', B.REHAB.national_benchmark, undefined);

// 5) Formerly-orphan fields now read their canonical Bible homes (added 2026-07-16)
eq('RATE_REFI reads Bible REFI', B.GLOBAL.RATE_REFI, STANDARDS.REFI.mortgageRate);
eq('AMORT_REFI reads Bible REFI', B.GLOBAL.AMORT_REFI, STANDARDS.REFI.amortizationYears);
eq('NOI_GROWTH_CONSERVATIVE reads Bible GROWTH', B.GLOBAL.NOI_GROWTH_CONSERVATIVE, STANDARDS.GROWTH.noiConservative);
eq('NOI_GROWTH_STRETCH reads Bible GROWTH', B.GLOBAL.NOI_GROWTH_STRETCH, STANDARDS.GROWTH.noiStretch);
eq('EXPENSE_GROWTH reads Bible GROWTH', B.GLOBAL.EXPENSE_GROWTH, STANDARDS.GROWTH.expenseAnnual);
eq('HOLDING_MONTHS reads Bible GLOBAL', B.GLOBAL.HOLDING_MONTHS, STANDARDS.GLOBAL.holdingMonthsDefault);
eq('RATE_OWNER reads Bible RESIDENTIAL', B.GLOBAL.RATE_OWNER, STANDARDS.RESIDENTIAL.ownerFinanceRate);
eq('no orphan fields remain', require('./bible-reader.js').NOT_IN_CANONICAL_BIBLE.length, 0);

console.log(`\nbible-reader regression: ${pass} passed, ${fail} failed`);
if (fail) { console.log(problems.join('\n')); process.exit(1); }
console.log('ALL PASS — bible-reader is a live projection of the canonical Bible.');
