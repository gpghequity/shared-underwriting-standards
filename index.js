/**
 * PLATFORM_UNDERWRITING_STANDARDS
 *
 * SINGLE SOURCE OF TRUTH for all REI platform underwriting assumptions.
 * Used across: Baby Analyzer, Lender Command, Auto Offer, Deal Analyzer, Net Sheet,
 * Comp Snapshot, Lending Intake, Report Engine, Vendor Directory Scoring
 * (Fast Calc excluded — standalone giveaway with embedded constants)
 *
 * Source: REI_PLATFORM_BIBLE_v11_25 (2026-07-13)
 * Authority: Stephen Franco / GPGH Equities
 * Last Verified: 2026-07-13
 * Last Modified: 2026-07-13 (v11.25: added CLOSING_COSTS section — commercial appraisal $4k,
 *   Phase I environmental $3.5k, 1% points, 1% lender fees, 2% buyer closing)
 * Prior: 2026-06-16 (v11.23: complete rehab systems, seller-finance $100k buyer, 8-scenario matrix)
 *
 * ALL TOOLS READ THIS FILE ON EVERY RUN.
 * New Bible upload = all tools automatically update. No code changes needed.
 */

const PLATFORM_UNDERWRITING_STANDARDS = {

  // ============================================================================
  // GLOBAL DEFAULTS (all asset classes)
  // ============================================================================

  GLOBAL: {
    wholesaleFeeAmount: 10_000,           // Flat wholesale fee on all offers
    closingCostsFlatAmount: 2_000,        // Flat closing costs default
    insuranceMonthly: 1_200,              // Annual insurance estimate
    taxesMonthly: 0,                      // Computed per property, not flat
    holdingCostPercentMonthly: 0.01,      // 1% monthly holding cost
    transferTaxPercent: 0.01,             // PA: 1% seller transfer tax
    titleEscrowRecordingPercent: 0.005,   // PA: 0.5% title/escrow/recording
    commissionDefaultPercent: 0.03,       // 3% or $4K minimum
    commissionMinimum: 4_000,
    pocketCashFloor: 10_000,              // HARD FLOOR: flag if below this
    sellingCostsPercent: 0.08,           // 8% of sale (Bible SELLING_COSTS)

    // Comps and AVM
    arvPercentile: 0.40,                  // ALWAYS 40th percentile, NEVER midpoint/average
    compSourcePriority: ['automatic', 'uploaded', 'manual'], // Order of preference

    // Income verification
    incomeVerification: 'current_verified_only', // Never use pro-forma
    daysOfIncomeHistory: 12,              // T-12 minimum for rentals

    // Carry / holding period default (months) — flip & bridge carry
    holdingMonthsDefault: 6,              // Default flip/bridge holding period in months

    // ── Homed 2026-07-16 from the analyzer fleet ─────────────────────────────
    // These were referenced by app code as C.HOLDING_PER_MONTH etc. but defined
    // NOWHERE — the reads returned undefined and the analyzers rendered literal
    // NaN to operators ("Holding (undefined months x $undefined)"). Values taken
    // from each app's dead config/defaults.json, which is where they had rotted.
    holdingCostPerMonth: 350,             // $/month carry (was C.HOLDING_PER_MONTH -> NaN)
    arvMinComps: 3,                       // minimum comps before an ARV is trusted
  },

  // ============================================================================
  // CLOSING COSTS (commercial-grade: storage / commercial / MHP)
  // Added Bible v11.25 (2026-07-13, S. Franco). Feed the "cash-to-close"
  // estimate ONLY — never the offer or valuation. Residential/rental deals
  // carry no bank fees (bankFees = 0).
  // ============================================================================
  // Published external reference data (homed 2026-07-22 from gorilla-calc-hub).
  // NOT Steve's underwriting — loan-program minimums are set by Fannie/FHA/VA/USDA,
  // state tax rates are published averages, input defaults are form starting values.
  // Homed so the flat calculators carry NO hardcoded number.
  REFERENCE: {
    loanPrograms: {
      conventional: { min: 5, max: 20, typical: 15 },
      fha:  { min: 3.5, max: 3.5, typical: 3.5 },
      va:   { min: 0, max: 0, typical: 0 },
      usda: { min: 0, max: 0, typical: 0 }
    },
    stateTaxRates: { pa: 0.0158, nj: 0.0084, ny: 0.0172, tx: 0.0180, fl: 0.0081 },
    inputDefaults: { vacancyRatePct: 5, occupancyRatePct: 85, annualAppreciationPct: 3 }
  },

  // Report/valuation confidence display thresholds (homed 2026-07-22 from
  // rei-report-engine). Presentation bands for how confident a generated report /
  // valuation is; homed so nothing is hardcoded.
  REPORT: {
    confidenceHigh: 0.85,
    confidenceMedium: 0.65,
    confidenceLow: 0.50,
    valuationGood: 0.80,
    valuationFair: 0.65,
    valuationPoor: 0.50,
    // DISPLAY/DISCUSSION ONLY — a reference cap rate shown on reports; NEVER used
    // to value a deal (deals use the DSCR ladder).
    displayCapRateResidential: 0.08,
    displayCapRateCommercial: 0.08
  },

  CLOSING_COSTS: {
    appraisalFee: 4_000,          // Commercial appraisal (typical $3,000–5,000)
    environmentalFee: 3_500,      // Phase I ESA (typical $2,500–5,000)
    bankPointsPct: 0.01,          // 1% loan origination points
    lenderFeesPct: 0.01,          // 1% lender / underwriting fees
    buyerClosingCostsPct: 0.02,   // 2% buyer-side (title, legal, misc) on offer

    // ── Homed 2026-07-16 from the analyzer fleet's constants.js ──────────────
    // NOTE FOR STEVE — each app disagrees with ITSELF on these three. The value
    // below is the one the LIVE code uses (src/math/constants.js). The app's dead
    // config/defaults.json carries a different number for the same key. Both are
    // recorded so you can rule; the live value is what ships today.
    surveyFee: 800,               // live constants.js:47 = 800   (dead defaults.json:64 = 2500)
    legalFee: 3_000,              // live constants.js:48 = 3000  (dead defaults.json:60 = 2500)
    insuranceSetupFee: 400,       // live constants.js:50 = 400   (dead defaults.json:65 = 5000)
    inspectionFee: 400,           // rei-net-sheet netSheet.js:183
    prepaidInterestPct: 0.005,    // rei-net-sheet netSheet.js:185
    escrowSetupMonths: 2,         // rei-net-sheet netSheet.js:186
  },

  // ============================================================================
  // RESIDENTIAL (SFR, MF, Rental)
  // ============================================================================

  RESIDENTIAL: {
    assetClass: 'residential',
    mortgageRate: 0.07,                   // 7.00%
    amortizationYears: 30,
    ltv: 0.80,                            // 80% LTV
    dscr: 1.25,                           // Min 1.25x
    arvMultiplier: 0.70,                 // MAO / cash-as-is factor (Bible §4)

    // Rental defaults. CAP RATE IS NEVER USED to value a deal (Steve, 2026-07-22):
    // rental/multifamily is valued on the DSCR ladder (RESIDENTIAL.dscr / ltv /
    // mortgageRate / amortizationYears). These are the remaining non-cap helpers.
    rentalDefaults: {
      grossToNoiEstimate: 0.50,// gross rent -> NOI when only rent is given
      grm: 10,                 // gross rent multiplier (comp reference only, not a valuation)
      rehabDefaultPct: 0.20,   // default rehab as % of value — comp-snapshot
      displayCapRate: 0.08     // DISPLAY/DISCUSSION ONLY — shown as a reference metric,
                               // NEVER used to value a deal (deals use the DSCR ladder).
    },

    // Cash-on-cash targets used to solve the two return-target offers on the
    // rental tab. Homed 2026-07-16 from rei-fast-calc/src/math/rental.js, where
    // they were hardcoded as `target: 0.10` / `target: 0.18` inside computeCard().
    returnTargets: {
      low: 0.10,                          // 10% CoC
      high: 0.18                          // 18% CoC
    },

    // Maintenance & vacancy management (MVM) pads (applies to NOI calculation for rental scenarios)
    // Formula: NOI = income - (MVM % of income) - actual hard costs
    // For all residential (including multifamily), these apply uniformly per Math Bible
    expensePads: {
      light: 0.00,      // 0% MVM = gross - hard costs only
      standard: 0.15,   // 15% MVM = conservative
      harsh: 0.30,      // 30% MVM = very conservative
      default: 'standard'
    },

    // Specific subclass rates (mixed-use defaults to residential rate)
    subclassDefaults: {
      sfr: { capRate: null, dscr: 1.25, comments: 'Uses DSCR ladder, not cap rate' },
      mf: { capRate: null, dscr: 1.25, comments: 'Uses DSCR ladder, not cap rate' },
      rental: { capRate: null, dscr: 1.25, comments: 'Uses DSCR ladder, not cap rate' }
    },

    // Hard mode (internal only — owner financing)
    ownerFinanceRate: 0.08,               // 8% owner-financing note rate (internal hard-mode)
    hardModeFormula: '(NOI / 1.25 - rehab - closing) / (0.8 * K + rate)',

    // Offer types
    cashAsIs: {
      formula: 'ARV × 0.70 - rehab_estimate',
      description: 'Cash offer for as-is property',
      requiresARV: true
    },

    termsOffer: {
      downPaymentPercent: 0.10,           // Legacy field for backward compat (app may still use this for old logic)
      interestRate: 0.05,                 // 5.00% seller note rate (Bible §4.8, S4)
      balloonYears: 15,                   // UPDATED: 15-year balloon (was 7, now v11.23 §4.8)
      amortizationYears: 25,              // UPDATED: 25-year amortization (was 30, now v11.23 §4.8)
      formula: 'seller_note_principal = (NOI / 1.25 - bank_DS - closing); monthly_payment = principal * K_SELLER(5%, 25yr)',
      description: 'Seller-financed offer (Bible v11.23 §4.8: $100k buyer cash, 5%, 25yr amort, 15yr balloon)'
    },

    // ── BIBLE v11.23: Seller-Finance Structure (Section 4.8, S4 scenario) ──
    sellerFinance: {
      buyerCashFixed: 100_000,            // Fixed $100k buyer cash minimum (Bible §4.8)
      interestRate: 0.05,                 // 5.00% seller note rate
      amortizationYears: 25,              // 25-year amortization
      balloonYears: 15,                   // 15-year balloon call
      kSeller: 0.07057,                   // Loan constant for 5%, 25yr
      description: 'Standard seller-finance structure: $100k buyer cash, seller fills equity gap'
    },

    listAsIs: {
      formula: 'ARV - (rehab_estimate * 0.93)',  // 93% realization
      description: 'List property as-is for retail sale',
      requiresARV: true
    },

    listAfterRepairs: {
      formula: 'ARV - commission_on_ARV',
      description: 'List property after repairs complete',
      requiresARV: true
    },

    // AUTO-OFFER V2 LISTING RULES
    listingAsIsHaggleFactor: 0.93,         // Market discount for as-is properties (buyer accepts repairs)
    listingRepairedARVRealization: 0.95,   // Minimal discount for repaired property
    buyerConcessionPercent: 0.02,          // Typical buyer concessions (2%)
    closingCostsPercent: 0.08,             // Cash offer: 8% of ARV for closing costs + profit buffer
    expectedDaysOnMarketRange: { low: 30, high: 90 },  // Typical market exposure time

    // ── BIBLE v11.23: Condition Tiers & Effective Cosmetic $/SF (Section 5.2–5.4) ──
    // Authority: REI Platform Bible v11.23 (Stephen Franco, 2026-06-16)
    // Rehab pricing is from line-item system below. These tiers apply condition multipliers.
    conditionTiers: {
      new: 0.00,               // Like-new, no work
      modern: 0.25,            // Minor cosmetic (25% of base cosmetic cost)
      semiModern: 0.50,        // Moderate updates (50% of base cosmetic cost)
      old: 0.80,               // Significant work (80% of base cosmetic cost)
      missing: 1.00,           // Complete replacement (100% of base cosmetic cost)
      drywallNeeded: 2.00,     // Structural damage, drywall out (200% of base cosmetic cost = $30/SF)
      studdedOut: 3.00         // Full gut to studs (300% of base cosmetic cost = $45/SF) ← NOT $110/SF
    },

    // Effective Cosmetic $/SF for verification (Bible Section 5.4)
    effectiveCosmetic_PSF: {
      new: 0.00,
      modern: 3.75,            // $15/SF × 25% = $3.75/SF
      semiModern: 7.50,        // $15/SF × 50% = $7.50/SF
      old: 12.00,              // $15/SF × 80% = $12.00/SF
      missing: 15.00,          // $15/SF × 100% = $15.00/SF
      drywallNeeded: 30.00,    // $15/SF × 200% = $30.00/SF
      studdedOut: 45.00        // $15/SF × 300% = $45.00/SF ← NOT $110/SF
    }
  },

  // ============================================================================
  // THREE-TIER OFFER FEES (Auto-Offer V2) — Bible v9
  // ============================================================================

  OFFER_TIERS_V9: {
    flipper_fee: 10_000,                  // Direct Investor = Retail − $10k
    fast_cash_fee: 20_000,                // Fastest Cash = Retail − $20k
    small_deal: 30_000,                   // Threshold below which use % instead of flat fee
    flipper_pct: 0.05,                    // 5% off retail on deals <$30k
    fast_cash_pct: 0.10,                  // 10% off retail on deals <$30k
    description: 'Three-tier offer structure: Retail (list), Direct Investor (−$10k), Fastest Cash (−$20k)'
  },

  // ============================================================================
  // STORAGE (Mini storage, climate-controlled, outdoor)
  // ============================================================================

  STORAGE: {
    assetClass: 'storage',
    mortgageRate: 0.0725,                 // 7.25%
    amortizationYears: 25,
    ltv: 0.75,                            // 75% LTV (even seller finance)
    dscr: {
      standard: 1.25,
      stretch: 1.15
    },
    noiMultiplier: 12.5,                  // 12.5x NOI (≈8% cap) per Bible v9
    expenseRatio: 0.35,                   // 35% expense floor if gross given

    expenseFloor: 0.35,                   // 35% FLOOR — binds upward only
    pocketCashFloor: 10_000,              // $10K Y1 minimum
    stabilizedNOIFloor: 40_000,           // KILL if under $40K

    // ── Homed 2026-07-16 from rei-fast-calc/src/math/storage.js ──
    // Cash-on-cash targets used to solve the two return-target offers. Previously
    // hardcoded as `target: 0.10` / `target: 0.18` inside calcStorage().
    returnTargets: {
      low: 0.10,                          // 10% CoC
      high: 0.18                          // 18% CoC
    },

    // Seller piece riding behind the bank loan on a storage seller-finance offer:
    // sfCombinedFactor = LTV × K_bank + (1 − LTV) × K_seller.
    // Previously hardcoded as SF_SELLER_RATE / SF_SELLER_AMORT in storage.js.
    sellerFinance: {
      rate: 0.05,                         // 5%
      amortYears: 25                      // 25yr amortization
    },

    // ── Homed 2026-07-16 from the analyzer fleet ─────────────────────────────
    // The kicker projection read C.PCT_DEFAULT / C.CAP_DEFAULT, which were
    // defined NOWHERE — every kicker payment rendered as NaN in the live UI, and
    // the one test covering it asserted only `length === 5`, so it passed green
    // while all five values were NaN. pct duplicates the existing
    // scenarios.groupC_sellerKicker_*.kickerPercent (0.20) — kept as a readable
    // key because that is how the app needs to consume it.
    sellerKicker: {
      pctDefault: 0.20,                   // 20% of NOI delta above baseline
      capCumulative: 50_000,              // lifetime cap on kicker payments (was C.CAP_DEFAULT -> NaN)
      windowYears: 5                      // years the kicker runs
    },

    pitiReserveMonths: 3,                 // months of PITI held in reserve
    workingCapitalPct: 0.25,              // working-capital reserve (= groupA equityPercent)

    // 10-scenario matrix (6 conventional + 4 seller finance)
    scenarios: {
      groupA_v1_1_25: {
        name: 'Bank Only (1.25x DSCR)',
        bankOnly: true,
        dscr: 1.25,
        equityPercent: 0.25,
        equityType: 'sunk'
      },
      groupA_v1_1_15: {
        name: 'Bank Only (1.15x DSCR)',
        bankOnly: true,
        dscr: 1.15,
        equityPercent: 0.25,
        equityType: 'sunk'
      },
      groupA_v2_1_25: {
        name: 'Bank + IO Equity (1.25x DSCR)',
        bankPercent: 0.75,
        equityPercent: 0.25,
        equityType: 'interest_only',
        equityRate: 0.08,
        dscr: 1.25
      },
      groupA_v2_1_15: {
        name: 'Bank + IO Equity (1.15x DSCR)',
        bankPercent: 0.75,
        equityPercent: 0.25,
        equityType: 'interest_only',
        equityRate: 0.08,
        dscr: 1.15
      },
      groupA_v3_1_25: {
        name: 'Bank + Amortized Equity (1.25x DSCR)',
        bankPercent: 0.75,
        equityPercent: 0.25,
        equityType: 'amortized',
        equityRate: 0.08,
        equityTerm: 25,
        dscr: 1.25
      },
      groupA_v3_1_15: {
        name: 'Bank + Amortized Equity (1.15x DSCR)',
        bankPercent: 0.75,
        equityPercent: 0.25,
        equityType: 'amortized',
        equityRate: 0.08,
        equityTerm: 25,
        dscr: 1.15
      },
      groupB_sellerNote_1_25: {
        name: 'Seller Note (1.25x DSCR)',
        sellerNotePercent: 0.75,
        bankPercent: 0.25,
        sellerNoteRate: 0.05,
        sellerNoteTerm: 10,
        dscr: 1.25,
        requiresSunsetTest: true
      },
      groupB_sellerNote_1_15: {
        name: 'Seller Note (1.15x DSCR)',
        sellerNotePercent: 0.75,
        bankPercent: 0.25,
        sellerNoteRate: 0.05,
        sellerNoteTerm: 10,
        dscr: 1.15,
        requiresSunsetTest: true
      },
      groupC_sellerKicker_1_25: {
        name: 'Seller Note + Kicker (1.25x DSCR)',
        sellerNotePercent: 0.75,
        bankPercent: 0.25,
        sellerNoteRate: 0.05,
        sellerNoteTerm: 10,
        kickerPercent: 0.20,  // 20% NOI delta above baseline
        dscr: 1.25,
        requiresSunsetTest: true
      },
      groupC_sellerKicker_1_15: {
        name: 'Seller Note + Kicker (1.15x DSCR)',
        sellerNotePercent: 0.75,
        bankPercent: 0.25,
        sellerNoteRate: 0.05,
        sellerNoteTerm: 10,
        kickerPercent: 0.20,
        dscr: 1.15,
        requiresSunsetTest: true
      }
    }
  },

  // ============================================================================
  // COMMERCIAL (Office, retail, industrial, restaurant, etc.)
  // ============================================================================

  COMMERCIAL: {
    assetClass: 'commercial',
    mortgageRate: 0.0725,                 // 7.25% (same as storage per Math Bible v3)
    amortizationYears: 25,                // 25yr standard
    ltv: 0.75,                            // 75% LTV (same as storage)
    dscr: {
      standard: 1.25,
      stretch: 1.15
    },

    // Subclass-specific cap rates, cap BANDS, expense floors and vacancy floors.
    //
    // capLow/capHigh/expenseFloor homed here 2026-07-16 from rei-fast-calc's
    // SUBCLASS_DEFAULTS (src/math/commercial.js), which kept its own private table.
    // The band drives the "implied cap is outside the typical range" warnings;
    // expenseFloor binds the underwritten expense ratio upward. Values unchanged
    // from what FastCalc already used.
    //
    // capRate (single point) is retained unchanged — existing readers depend on it.
    // Where a subclass has both, capRate is the point estimate and capLow/capHigh
    // is the acceptable band around it.
    //
    // vacancyFloor is the BIBLE's value and wins over FastCalc's differing figure
    // (Steve 2026-07-16: "Bible wins"). FastCalc's math never read vacancyFloor,
    // so nothing changes numerically. See LOG note for the two capRate/band
    // disagreements flagged to Steve (officeMedical, restaurant).
    subclasses: {
      retailStrip:    { capRate: 0.08,  capLow: 0.065, capHigh: 0.085, expenseFloor: 0.30, vacancyFloor: 0.10, comments: 'Single-tenant or multi-tenant. Watch top-tenant concentration.' },
      singleTenant:   { capRate: 0.07,  capLow: 0.055, capHigh: 0.075, expenseFloor: 0.10, vacancyFloor: 0.05, comments: 'Credit tenant preferred. Cap is a function of tenant credit + lease term.' },
      officeGeneral:  { capRate: 0.085, capLow: 0.075, capHigh: 0.105, expenseFloor: 0.40, vacancyFloor: 0.12, comments: 'Class A/B/C varies. Office vacancy elevated post-2020; underwrite 12-18% min.' },
      officeMedical:  { capRate: 0.085, capLow: 0.065, capHigh: 0.080, expenseFloor: 0.32, vacancyFloor: 0.08, comments: 'Longer leases. Heavy buildout on renewal ($50-150/SF TI common).' },
      industrialFlex: { capRate: 0.075, capLow: 0.055, capHigh: 0.075, expenseFloor: 0.15, vacancyFloor: 0.08, comments: '3PL, last-mile. Strong fundamentals most metros.' },
      warehouse:      { capRate: 0.065, capLow: 0.050, capHigh: 0.070, expenseFloor: 0.10, vacancyFloor: 0.05, comments: 'Modern specs premium. Cap rates compressed since 2020.' },
      mixedUse:       { capRate: null,  capLow: 0.065, capHigh: 0.090, expenseFloor: 0.35, vacancyFloor: 0.10, comments: 'Blended by tenant mix — see rei-mixed-use for per-asset blend valuation.' },
      restaurant:     { capRate: 0.10,  capLow: 0.055, capHigh: 0.080, expenseFloor: 0.10, vacancyFloor: 0.00, comments: 'Triple-net or proprietor. QSR/national = tight cap; independent = wider.' },
      carwash:        { capRate: 0.095, capLow: 0.075, capHigh: 0.110, expenseFloor: 0.35, vacancyFloor: 0.00, comments: 'High-margin, service. Equipment-heavy — high capex reserve.' },
      specialPurpose: { capRate: null,  capLow: 0.070, capHigh: 0.110, expenseFloor: 0.25, vacancyFloor: null, comments: 'Case-by-case. Re-tenanting risk; discount cap for time-to-fill.' },
      other:          { capRate: null,  capLow: 0.060, capHigh: 0.100, expenseFloor: 0.25, vacancyFloor: 0.05, comments: 'Generic commercial defaults — override based on local comps.' }
    },

    // Maps the snake_case subclass keys used by app UIs to the Bible's camelCase
    // keys, so an app never has to keep its own copy of the subclass table.
    subclassAliases: {
      retail_strip: 'retailStrip',
      retail_single: 'singleTenant',
      office_general: 'officeGeneral',
      office_medical: 'officeMedical',
      industrial_flex: 'industrialFlex',
      industrial_warehouse: 'warehouse',
      mixed_use: 'mixedUse',
      restaurant: 'restaurant',
      self_serve_carwash: 'carwash',
      special_purpose: 'specialPurpose',
      other: 'other'
    },

    // Human labels for the subclass pickers — homed from FastCalc's SUBCLASS_LABELS.
    subclassLabels: {
      retailStrip: 'Retail — strip / multi-tenant',
      singleTenant: 'Retail — single-tenant NNN',
      officeGeneral: 'Office — general / multi-tenant',
      officeMedical: 'Office — medical (MOB)',
      industrialFlex: 'Industrial — flex / light',
      warehouse: 'Industrial — warehouse / distribution',
      mixedUse: 'Mixed-use (retail + office/residential)',
      restaurant: 'Restaurant / QSR',
      carwash: 'Self-serve car wash',
      specialPurpose: 'Special purpose (bank, daycare, vet)',
      other: 'Other / generic commercial'
    },

    // Cash-on-cash return targets used to solve the two return-target offers
    // (added 2026-07-16 as the Bible home for FastCalc's previously orphaned
    // DEFAULT_RETURN_TARGET_LOW/HIGH — values unchanged, now canonical)
    returnTargets: {
      low: 0.10,                          // 10% CoC — the "will do" offer
      high: 0.18                          // 18% CoC — the "want" offer
    },

    // ── Homed 2026-07-16 from the analyzer fleet's src/math/commercial.js ────
    // That file declared "own constants… drift is acceptable" and diverged from
    // this Bible on rate/amort (0.07/30 vs 0.0725/25) — an 8.64% systematic
    // OVERPAY on every commercial deal. The values below are the ORPHANS from
    // that file that had no Bible home at all; the diverging rate/amort are NOT
    // re-homed here — COMMERCIAL.mortgageRate / .amortizationYears above already
    // own those and the apps must be corrected to read them.
    lenderTermYears: 5,                   // balloon term on the bank piece (amort is separate)
    lenderDscrFloor: 1.20,                // DSCR below this fires the lender red flag
    collectionLossPct: 0.02,              // collection loss on commercial income
    propMgmtPctDefault: 0.05,             // property management as % of EGI
    genericGrossToNoiEstimate: 0.40,      // generic-commercial gross->NOI when no subclass (homed 2026-07-22 from rei-auto-offer)
    waltMinYears: 3,                      // weighted-average lease term below this = warning
    repositionVacancyThreshold: 0.20,     // physical vacancy above this = reposition play
    topTenantRolloverWarnMonths: 12,      // top tenant rolling within this = warning
    mgCamRecoveryShare: 0.50,             // modified-gross leases recover ~50% of CAM

    // Seller-finance note that rides behind the bank loan on a commercial
    // seller-finance offer. Homed 2026-07-18 from the analyzer fleet's
    // CommercialTab (rei-*-analyzer), which defaulted its seller terms to 6% / 20yr
    // with NO Bible home — a divergence from the platform's universal 5% / 25yr
    // seller note (identical to RESIDENTIAL.sellerFinance / STORAGE.sellerFinance /
    // MHP.sellerFi). Adding a home only; no existing number changes.
    sellerFinance: {
      rate: 0.05,                         // 5%
      amortYears: 25                      // 25yr amortization
    },

    // MVM pads applied to commercial income. NOTE: these are COMMERCIAL's own
    // pads and happen to equal MHP's (0/20/30); they are deliberately NOT the
    // residential expensePads (0/15/30). Do not merge the three.
    mvmPads: {
      standard: 0.00,
      mvm20: 0.20,
      mvm30: 0.30
    },

    // Reserve assumptions ($/SF/yr unless noted)
    reserves: {
      tiLcPsfDefault: 0.75,               // tenant improvements + leasing commissions
      capexPsfDefault: 0.30,              // capital expenditure reserve
      medicalTiLcPsf: 1.25,               // medical office carries heavier TI on renewal
      oldBuildingCapexPsf: 0.50,          // capex reserve for pre-cutoff buildings
      oldBuildingYearCutoff: 1990         // built before this = "old building"
    },

    // Mixed-use blending formula
    mixedUseFormula: 'blended_cap = (capRate_A * sqft_A + capRate_B * sqft_B) / total_sqft',

    // NNN and tenant concentration flags
    nnnFlowThrough: true,                 // NNN reimbursements are pass-through
    tenantConcentrationThreshold: 0.40,   // Flag if >40% of GLA

    // Lease audit required: must have current executed leases + estoppels
    leaseAuditRequired: true
  },

  // ============================================================================
  // MHP (Mobile Home Parks)
  // ============================================================================

  MHP: {
    assetClass: 'mhp',
    capRateRange: { min: 0.085, max: 0.10 }, // 8.5–10% typically
    mortgageRate: 0.0725,                 // 7.25% (same as storage per Math Bible v3)
    amortizationYears: 25,                // 25yr standard (same as storage)
    ltv: 0.75,                            // 75% LTV (same as storage)
    dscr: 1.25,
    noiMultiplier: 12.5,                  // 12.5x NOI (≈8% cap) per Bible v9
    expenseRatio: 0.60,                   // 60% expense assumption for NOI if gross given

    // Critical MHP factors
    padRentStability: 'required',         // 2yr history minimum
    pohVsToHSplit: 'required',            // Park-owned vs tenant-owned units affects valuation
    infillExecutionRisk: 'required',      // Can new units be added?
    utilityRedFlags: {
      ownerPays: 'MAJOR FLAG',            // Owner utility responsibility is high-risk
      regulatoryRisk: 'MAJOR FLAG'        // Rent caps, approval requirements vary by state
    },

    // ── Homed 2026-07-16 from rei-fast-calc/src/math/mhp.js + config/defaults.js ──
    // Steve: "Whatever any app needs that's not in the Bible gets added to the Bible."
    // Every value below was previously a hardcoded literal inside FastCalc with no
    // Bible home, so it could never follow a Bible change. Values are UNCHANGED from
    // what the app already used — this is a move, not a re-rate.

    // MVM (Market Value Method) pads applied to gross scheduled income, per card.
    // NOTE: these are MHP's OWN pads (0 / 20% / 30%) and are deliberately NOT the
    // residential expensePads (0 / 15% / 30%). Do not merge the two.
    mvmPads: {
      standard: 0.00,                     // Card 1 — "Bank Only — 0% MVM"
      mvm20: 0.20,                        // Card 2 — "MVM 20% — vacancy/management/maintenance"
      mvm30: 0.30                         // Card 3 — "MVM 30% — conservative"
    },

    // POH (park-owned home) risk thresholds — drive flags, not math.
    pohHeavyThreshold: 0.25,              // (occPoh+vacPoh)/totalLots above this -> lender haircut flag
    pohVacancyThreshold: 0.20,            // vacantPoh/totalPoh above this -> high POH vacancy flag
    vacantLotThreshold: 0.15,             // vacantLots/totalLots above this -> significant inventory flag

    // POH carries extra operating burden vs a TOH baseline. Applied as
    // opExBase × pohOpexPad × pohShare, where pohShare = totalPoh/totalOccupied.
    pohOpexPad: 0.30,

    // Operating assumptions (defaults; user overrides per deal)
    managementPct: 0.07,                  // management fee as % of EGI
    tohVacancyPct: 0.05,                  // vacancy cushion on tenant-owned-home lot rent
    pohVacancyPct: 0.10,                  // vacancy cushion on park-owned-home rent
    collectionLossPct: 0.02,              // collection loss on income after vacancy
    seniorTerm: 10,                       // senior loan term (years) — amort is amortizationYears

    // Seller financing that sits on top of the senior loan for MHP.
    sellerFi: {
      rate: 0.05,                         // 5%
      amortYears: 25,                     // 25yr amortization
      pct: 1.00                           // share of remaining equity carried by seller
    },

    // Utility responsibility matrix. Burden = costAnnual × (1 − recoveryPct) for
    // park-paid/submeter; tenant-direct costs the park nothing.
    utilityKeys: ['water', 'sewer', 'trash', 'electric', 'gas'],
    parkBurdenModes: ['park-paid', 'submeter'],
    utilityDefaults: {
      water:    { mode: 'park-paid',     costAnnual: null, recoveryPct: null },
      sewer:    { mode: 'park-paid',     costAnnual: null, recoveryPct: null },
      trash:    { mode: 'park-paid',     costAnnual: null, recoveryPct: null },
      electric: { mode: 'tenant-direct', costAnnual: null, recoveryPct: null },
      gas:      { mode: 'tenant-direct', costAnnual: null, recoveryPct: null }
    }
  },

  // ============================================================================
  // RV PARKS (Bible v9)
  // ============================================================================

  RV_PARK: {
    assetClass: 'rv_park',
    capRateRange: { min: 0.075, max: 0.08 }, // 7.5–8% typically
    mortgageRate: 0.0725,
    amortizationYears: 25,
    ltv: 0.75,
    dscr: 1.25,
    noiMultiplier: 13,                    // 13x NOI (≈7.5–8% cap) per Bible v9
    expenseRatio: 0.55,                   // 55% expense assumption (transient guests = higher opex than MHP)
    description: 'RV parks with transient guest mix'
  },

  // ============================================================================
  // IOS — INDUSTRIAL OUTDOOR STORAGE (Bible v9)
  // ============================================================================

  IOS: {
    assetClass: 'ios',
    capRateRange: { min: 0.07, max: 0.07 }, // 7% cap
    mortgageRate: 0.0725,
    amortizationYears: 25,
    ltv: 0.75,
    dscr: 1.25,
    noiMultiplier: 14,                    // 14x NOI (≈7% cap) per Bible v9
    expenseRatio: 0.20,                   // 20% expense ratio (very low opex: perimeter, lighting, security)
    description: 'Fenced gravel/asphalt yards for equipment storage'
  },

  // ============================================================================
  // STORAGE — NOI MULTIPLIER (Bible v9)
  // ============================================================================

  // Add to existing STORAGE section below...

  // ============================================================================
  // LENDING (Private lending, fix-and-flip, fix-and-hold)
  // ============================================================================

  LENDING: {
    assetClass: 'lending',
    loanAmount: 'ARV based',
    ltv: { max: 0.75 },                   // ≤75% LTV of ARV (residential)

    // Max LTV the lender will fund, per asset type (lending product guideline —
    // distinct from the valuation capital-stack LTV above). One home for these.
    ltvByAssetType: {
      'Single Family': 0.80, '2-4 Unit': 0.80, 'Multi-Family 5+': 0.75,
      'Mixed-Use': 0.70, 'Commercial': 0.70, 'Self Storage': 0.70, 'MHP': 0.70,
      'Flip': 0.85, 'Fix & Flip': 0.85
    },
    ltvByAssetTypeDefault: 0.75,
    interestRate: 0.12,                   // 12% baseline
    pointsPercent: 0.02,                  // 2% points
    term: '6-12 months',                  // Typically short-term bridge

    // ── TRANSACTIONAL (24-90hr double-close) ──────────────────────────────
    // A different product from DSCR/term lending: underwrites CLOSING risk, not
    // the borrower's credit or long-term value. Homed 2026-07-16 from
    // rei-transactional-lending/services/scoring.js, where these were hardcoded.
    transactional: {
      // Gross spread (B->C price minus A->B price) below which the deal is
      // flagged as a thin margin for transactional funding. Was `< 5000`
      // hardcoded in detectRedFlags().
      minGrossSpread: 5_000,

      // When a borrower does not supply estimated closing costs, they are
      // estimated as A->B price x this pct. This MUST be
      // CLOSING_COSTS.buyerClosingCostsPct (0.02).
      //
      // BUG THIS REPLACES (found 2026-07-16): scoring.js read
      // `BIBLE.GLOBAL.buyerClosingCostsPct || 0.04`. There is no
      // buyerClosingCostsPct on GLOBAL — it lives on CLOSING_COSTS — so the read
      // was undefined and it silently used the 0.04 fallback. That is 4% vs the
      // Bible's 2%: exactly DOUBLE. On a $200k A->B it charged $8,000 instead of
      // $4,000, understating net spread by $4,000 on every deal where closing
      // costs weren't provided — and net spread drives both the
      // "negative net spread" red flag and the funding recommendation.
      closingCostEstimatePctSource: 'CLOSING_COSTS.buyerClosingCostsPct'
    },

    // DSCR worksheet floors + the rate stress test used when underwriting a
    // rent-roll. Homed 2026-07-19 from lender-command/lib/dscr.js, where all of
    // these were hardcoded in computeWorksheet() with no Bible read at all.
    //
    // These are FLOORS, not estimates: a borrower may submit a lower vacancy,
    // management or R&M assumption, and the worksheet raises it to these values.
    // That is deliberate — the lender underwrites to its own minimum, not to the
    // borrower's optimism. Only the floor binds; a HIGHER submitted number is
    // kept as-is.
    //
    // NOTE ON managementPctFloor: this is the same 5% as
    // COMMERCIAL.propMgmtPctDefault and is intentionally NOT a duplicate value
    // with a life of its own — it is homed here because it is applied as a
    // lending floor rather than as a commercial operating default. If Steve
    // changes one he should consider the other.
    dscrWorksheet: {
      vacancyFloorPct: 0.05,        // was `Math.max(0.05, actualVacRate)`
      managementPctFloor: 0.05,     // was `Math.max(0.05, mgmt_pct/100)`
      repairsMaintPctFloor: 0.05,   // was `Math.max(0.05, rm_pct/100)`
      reservesPerUnitFloor: 250,    // was `Math.max(250, reserves_per_unit)`, $/unit/yr

      // Interest rate the loan is re-underwritten at to see whether the deal
      // still covers debt service if rates move against it. Distinct from
      // LENDING.stressTests above, which stress the ARV, not the rate.
      stressTestRatePct: 8.25       // was a bare `const stressRate = 8.25`
    },

    // DSCR INTAKE worksheet (homed 2026-07-22 from rei-lending-intake/services/dscr.js).
    // Distinct from dscrWorksheet above (lender-command's single floors) — this app
    // floors PER coarse property type. Floors bind upward only; reserves are $/unit
    // or $/sqft by type. NOTE (for Steve): these coarse-type vacancy floors run LOWER
    // than the Bible's per-subclass COMMERCIAL vacancy floors — a mapping ruling is
    // still open, but the values are now homed rather than hardcoded.
    dscrIntake: {
      vacancyFloorByType: { multifamily: 0.05, mixed_use: 0.05, retail: 0.05, industrial: 0.05, office: 0.10, default: 0.05 },
      managementFloorPct: 0.05,   // of total rents
      maintenanceFloorPct: 0.05,  // of total rents
      reservesRate: {
        multifamily: { type: 'per_unit', rate: 250 },
        mixed_use:   { type: 'per_sqft', rate: 0.20 },
        retail:      { type: 'per_sqft', rate: 0.15 },
        industrial:  { type: 'per_sqft', rate: 0.15 },
        office:      { type: 'per_sqft', rate: 0.20 }
      }
    },

    // Required docs
    requiredDocs: [
      'personal_guarantee',
      'lien_position_confirmed',
      'title_commitment',
      'proof_of_funds'
    ],

    // Stress test at ARV miss scenarios
    stressTests: [
      { miss: -0.10, label: '-10% ARV miss' },
      { miss: -0.20, label: '-20% ARV miss' },
      { miss: -0.25, label: '-25% ARV miss' },    // PRIMARY decision lens
      { miss: -0.30, label: '-30% ARV miss' },
      { miss: -0.50, label: '-50% ARV miss' }
    ],

    // Decision rule on stress test
    stressTestDecisionRule: 'If -25% ARV miss loses the lender money (first lien recovery breaks), WALK unless borrower has documented liquidity > shortfall'
  },

  // ============================================================================
  // OFFER TERMINOLOGY (Unified across all tools)
  // ============================================================================

  OFFER_VERDICTS: {
    PASS: 'Deal does not meet acquisition criteria. Do not pursue.',
    PURSUE: 'Deal meets criteria. Recommended action: make offer.',
    TENTATIVE: 'Deal may work but requires verified T-12 + rent roll + occupancy confirmation.',
    NEGOTIATE: 'Deal works at higher price or different terms. Counter or renegotiate.',
    KILL: 'Deal has unreconcilable issues. Do not pursue under any terms.'
  },

  OFFER_TYPES: {
    cash: 'Cash offer, no financing',
    terms: 'Seller-financed offer (10% down, 5% rate, 7yr balloon, 30yr amort)',
    list_as_is: 'List property as-is for retail sale (ARV - rehab * 0.93)',
    list_after_repairs: 'List property after repairs complete',
    wholesale: 'Assign to end buyer'
  },

  // ============================================================================
  // UI CONFIGURATION
  // ============================================================================

  UI: {
    // Which fields to display for internal/team users (can adjust)
    internalAdjustableFields: [
      'mortgageRate',
      'dscr',
      'expensePad',
      'ltv',
      'capRate',
      'wholesaleFee',
      'commissionPercent',
      'arvPercentile',
      'holdingCostPercent'
    ],

    // Which fields are displayed to public sellers (read-only, no adjustment)
    publicDisplayFields: [
      'ARV',
      'Rehab Estimate',
      'Your Cash Offer',
      'Terms Offer',
      'List-As-Is Offer',
      'Next Steps'
    ],

    // Never show to public sellers
    publicHiddenFields: [
      'DSCR',
      'LTV',
      'Expense Pad',
      'Mortgage Rate',
      'Pocket Cash Calculation',
      'Stress Tests'
    ]
  },

  // ============================================================================
  // REHAB SYSTEMS (from Bible v11.23 Section 5) — Authoritative
  // ============================================================================

  REHAB: {
    // ── QUICK all-in $/SF ladder (Steve's national numbers, homed 2026-07-22) ──
    // The Bible's per-system model below (tiers × systems) is the LINE-ITEM engine
    // used by the complex tools (rehab-calc, baby analyzer, the analyzer forks).
    // This nationalPsf ladder is the FAST path: one blended $/SF applied to whole-
    // house square footage, keyed to a 5-step condition, for quick tools like
    // rei-auto-offer (the seller offer path).
    //
    // Purpose of homing it: auto-offer and baby's "national averages" column each
    // carried their OWN hardcoded copy of this ladder and DISAGREED
    // (auto-offer 5/25/45/75/110, baby 8/22/45/80/130 ×1.07). Now there is ONE
    // canonical ladder every fast path reads, so they can never drift again.
    //
    // regionalAdj: national figures are used as-is (1.0). Baby previously multiplied
    // its national column by 1.07 for PA; that bump is now a single Bible knob —
    // set to 1.07 to apply a PA/mid-Atlantic uplift uniformly across every app.
    // National MARKET benchmark dataset (homed 2026-07-22 from rei-data-enrichment).
    // Reference market data (Remodeling Magazine / HomeAdvisor medians) with low/
    // median/high ranges + regional adjustments + per-system ranges — used by the
    // enrichment API's "national averages" comparison. Distinct from nationalPsf
    // below, which is STEVE'S authoritative quick ladder. Homed so nothing is hardcoded.
    nationalBenchmarks: {
      psfByTier: {
        move_in:      { low: 3,   median: 5,   high: 10,  note: 'paint + minor cosmetic only' },
        light_rehab:  { low: 18,  median: 25,  high: 35,  note: 'paint, flooring, minor fixtures' },
        medium_rehab: { low: 35,  median: 45,  high: 60,  note: 'kitchen OR bath update + cosmetics' },
        heavy_rehab:  { low: 65,  median: 80,  high: 110, note: 'multiple systems + kitchen + bath' },
        studs:        { low: 95,  median: 120, high: 175, note: 'down to studs / full gut' }
      },
      regionalAdjustments: {
        mid_atlantic: 1.07, northeast: 1.15, midwest: 0.92, south: 0.85,
        west: 1.20, pacific: 1.25, national: 1.00
      },
      perSystemRanges: {
        roof_replacement_psf:       { low: 4,   median: 6.5, high: 10,  note: 'tear-off + new shingle' },
        hvac_replacement_unit:      { low: 6000, median: 9000, high: 14000, note: 'central air + furnace' },
        electrical_full_rewire_psf: { low: 4,   median: 7,   high: 12,  note: 'full panel + circuits' },
        plumbing_full_replumb_psf:  { low: 4,   median: 7,   high: 11,  note: 'full repipe' },
        kitchen_remodel_total:      { low: 18000, median: 30000, high: 60000, note: 'mid-range remodel, ~150 sqft kitchen' },
        bathroom_remodel_total:     { low: 8000,  median: 14000, high: 28000, note: 'mid-range remodel, full bath' },
        windows_per_unit:           { low: 450, median: 700, high: 1200, note: 'mid-range double-hung' },
        exterior_paint_psf:         { low: 1.5, median: 2.5, high: 4,   note: 'whole house exterior' },
        flooring_psf_lvp:           { low: 4,   median: 6,   high: 9,   note: 'mid-range LVP install' },
        flooring_psf_hardwood:      { low: 8,   median: 12,  high: 18,  note: 'mid-range hardwood install' }
      },
      source: 'Remodeling Magazine 2024 Cost vs Value + HomeAdvisor + BLS'
    },

    // pic-rehab's photo-estimation cost model (homed 2026-07-22 from rei-pic-rehab).
    // A distinct per-system model (LOCAL PA template + NATIONAL by asset class + its
    // own condition-tier %s). Homed so nothing is hardcoded in the app.
    picRehab: {
      localCosts: {
        per_system: {
          windows: { per_unit: 350, unit_name: 'window' },
          roof: { per_sqft: 6, unit_name: 'sqft of roof' },
          kitchen: { per_unit: 6500, unit_name: 'kitchen' },
          full_bath: { per_unit: 3000, unit_name: 'full bath' },
          half_bath: { per_unit: 1500, unit_name: 'half bath' },
          three_quarter_bath: { per_unit: 2000, unit_name: '3/4 bath' },
          furnace: { per_unit: 3000, unit_name: 'furnace' },
          plumbing: { per_unit: 7000, unit_name: 'plumbing system' },
          electrical: { per_unit: 8000, unit_name: 'electrical system' },
          exterior: { per_unit: 5000, unit_name: 'exterior work' },
          siding: { per_sqft: 6, unit_name: 'sqft of siding' },
          appliances: { per_unit: 1300, unit_name: 'appliance set' },
          porch: { per_unit: 2500, unit_name: 'porch' },
          basement: { per_sqft: 8, unit_name: 'sqft of basement' },
          structure: { per_unit: 10, unit_name: 'structural item' },
          cosmetic: { per_unit: 17, unit_name: 'cosmetic item' }
        },
        regional_adjusters: { pa_urban: 1.0, pa_suburban: 0.95, pa_rural: 0.90 }
      },
      nationalCosts: {
        single_family: {
          windows: { per_unit: 400, note: 'standard replacement window' }, roof: { per_sqft: 8, note: 'asphalt shingles, full replacement' }, kitchen: { per_unit: 8000, note: 'moderate kitchen remodel' }, full_bath: { per_unit: 4000, note: 'moderate bath remodel' }, half_bath: { per_unit: 2000, note: 'moderate half-bath' }, three_quarter_bath: { per_unit: 3000, note: 'moderate 3/4 bath' }, furnace: { per_unit: 4000, note: 'new furnace install' }, plumbing: { per_unit: 9000, note: 'partial replumb' }, electrical: { per_unit: 10000, note: 'electrical panel upgrade' }, exterior: { per_unit: 6000, note: 'exterior paint, minor repairs' }, siding: { per_sqft: 10, note: 'vinyl siding replacement' }, appliances: { per_unit: 2000, note: 'stainless steel appliance set' }, foundation: { per_sqft: 15, note: 'minor foundation work' }, structure: { per_unit: 0, note: 'structural work by quote' }
        },
        multifamily: {
          windows: { per_unit: 350, note: 'standard window per unit' }, roof: { per_sqft: 7, note: 'commercial-grade roof' }, kitchen: { per_unit: 6000, note: 'basic kitchen per unit' }, full_bath: { per_unit: 3500, note: 'basic bath per unit' }, half_bath: { per_unit: 1800, note: 'basic half-bath per unit' }, three_quarter_bath: { per_unit: 2500, note: 'basic 3/4 bath per unit' }, furnace: { per_unit: 3500, note: 'unit-level heating' }, plumbing: { per_unit: 8000, note: 'unit-level plumbing' }, electrical: { per_unit: 9000, note: 'unit-level electrical' }, exterior: { per_unit: 4000, note: 'common area exterior' }, siding: { per_sqft: 8, note: 'common area siding' }, appliances: { per_unit: 1500, note: 'basic appliances per unit' }, foundation: { per_sqft: 12, note: 'foundation inspection/repair' }, structure: { per_unit: 0, note: 'structural work by quote' }
        },
        storage: { roof: { per_sqft: 5, note: 'metal roof per unit' }, exterior: { per_sqft: 3, note: 'exterior paint/repair per sqft' }, doors: { per_unit: 500, note: 'roll-up door per unit' }, climate_control: { per_unit: 2000, note: 'AC/heating unit' }, structure: { per_unit: 0, note: 'structural by quote' } },
        mhp: { roof: { per_unit: 2000, note: 'pad roof repair/replacement' }, exterior: { per_unit: 1500, note: 'exterior siding/paint per lot' }, utilities: { per_unit: 3000, note: 'water/sewer/electric per lot' }, common_area: { per_sqft: 2, note: 'common area maintenance' }, structure: { per_unit: 0, note: 'structural by quote' } },
        rv_park: { electrical: { per_unit: 1500, note: '50-amp pedestal per pad' }, water: { per_unit: 1000, note: 'water connection per pad' }, sewer: { per_unit: 1200, note: 'sewer connection per pad' }, parking: { per_sqft: 2, note: 'parking area per sqft' }, common_area: { per_sqft: 3, note: 'clubhouse/facilities per sqft' }, structure: { per_unit: 0, note: 'structural by quote' } },
        ios: { exterior: { per_sqft: 4, note: 'fencing/exterior per sqft' }, lighting: { per_unit: 800, note: 'light post per unit' }, security: { per_sqft: 1, note: 'security fencing per sqft' }, structure: { per_unit: 0, note: 'structural by quote' } },
        commercial: { roof: { per_sqft: 8, note: 'commercial roof' }, hvac: { per_sqft: 5, note: 'HVAC per sqft' }, electrical: { per_sqft: 3, note: 'electrical per sqft' }, plumbing: { per_sqft: 2, note: 'plumbing per sqft' }, structure: { per_unit: 0, note: 'structural by quote' } }
      },
      conditionTiers: {
        new: { rank: 0, pct_work: 0 }, gold_leaf: { rank: 1, pct_work: 0.02 }, light_rehab: { rank: 2, pct_work: 0.10 }, moderate_rehab: { rank: 3, pct_work: 0.25 }, semi_modern: { rank: 3, pct_work: 0.25 }, heavy_rehab: { rank: 4, pct_work: 0.40 }, old: { rank: 4, pct_work: 0.40 }, studs: { rank: 5, pct_work: 0.75 }, missing: { rank: 5, pct_work: 0.75 }
      }
    },
    nationalPsf: {
      move_in: 8,        // move-in ready
      light_rehab: 15,   // light / cosmetic (paint + flooring) — matches cosmetic line base
      medium_rehab: 25,  // medium (kitchen / bath + cosmetics)
      heavy_rehab: 45,   // heavy (multiple systems)
      studs: 110         // down to studs / full gut
    },
    nationalPsfRegionalAdj: 1.00,
    nationalPsfSource: "Steve's national rehab $/SF ladder (2026)",

    // Condition tier cost multipliers (applied to base costs per Section 5.2)
    tiers: {
      new: 0.00,               // Like-new, no work
      modern: 0.25,            // Minor cosmetic
      semiModern: 0.50,        // Moderate updates
      old: 0.80,               // Significant work
      missing: 1.00,           // Complete replacement
      drywallNeeded: 2.00,     // Structural damage, drywall out
      studdedOut: 3.00         // Full gut to studs
    },

    // System-by-system base costs (Bible Section 5.3–5.4)
    systems: {
      cosmetic: { baseCost: 15, unit: 'per_sqft', description: 'Paint, flooring, cosmetics' },
      windows: { baseCost: 350, unit: 'per_window', description: 'Window replacement' },
      siding: { baseCost: 12, unit: 'per_sqft', description: 'Siding replacement' },
      roof: { baseCost: 7, unit: 'per_sqft', description: 'Roofing' },
      kitchen: { tiers: { new: 0, modern: 2000, semiModern: 4000, old: 7000, missing: 10000 }, unit: 'per_unit' },
      fullBath: { tiers: { new: 0, modern: 1500, semiModern: 2500, old: 4000, missing: 6000 }, unit: 'per_bath' },
      halfBath: { tiers: { new: 0, modern: 800, semiModern: 1500, old: 2500, missing: 4500 }, unit: 'per_bath' },
      threeQtrBath: { tiers: { new: 0, modern: 1000, semiModern: 2000, old: 3000, missing: 5000 }, unit: 'per_bath' },
      appliances: { tiers: { new: 0, modern: 400, semiModern: 700, old: 1500, missing: 1800 }, unit: 'per_unit' },
      exterior: { amounts: [0, 500, 1500, 2500, 5000, 8000, 10000], unit: 'dropdown' },
      porch: { amounts: [0, 500, 1500, 2500, 5000, 8000, 10000], unit: 'dropdown' },
      basement: { amounts: [0, 500, 1500, 2500, 5000, 8000, 10000], unit: 'dropdown' },
      structure: { amounts: [0, 500, 1500, 2500, 5000, 8000, 10000], unit: 'dropdown' },
      furnace: { amounts: [0, 1000, 2000, 3000, 6000, 10000], unit: 'dropdown' },
      plumbing: { amounts: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000], unit: 'dropdown' },
      electrical: { amounts: [0, 500, 1000, 2000, 4000, 6000, 8000], unit: 'dropdown' },
      holding: { amounts: [0, 200, 500, 1000, 1500, 3000, 5000], unit: 'per_month', description: 'Carrying costs' }
    },

    // ── STORAGE rehab systems (homed 2026-07-22 from the analyzer forks) ──
    // Self-storage rehab $/unit + dropdown ladders. Tier MULTIPLIERS come from REHAB.tiers.
    // These were app-local orphans (no Bible home); now canonical so nothing is hardcoded.
    storage: {
      systems: {
        roof:           { baseCost: 6,   unit: 'per_sqft',   description: 'Roof / membrane (TPO/EPDM)' },
        rollupDoors:    { baseCost: 355, unit: 'per_door',   defaultCount: 'totalUnits', description: 'Roll-up doors turnkey' },
        doorHardware:   { baseCost: 50,  unit: 'per_door',   defaultCount: 'totalUnits', description: 'Spring kit + latch' },
        pavement:       { baseCost: 5,   unit: 'per_sqft',   description: 'Pavement / drive aisles' },
        fencing:        { baseCost: 22,  unit: 'per_lf',     description: '6ft chain link installed' },
        cameras:        { baseCost: 500, unit: 'per_camera', defaultCount: 8, description: 'Cameras / security' },
        poleLights:     { baseCost: 2000,unit: 'per_pole',   defaultCount: 4, description: 'LED pole / area lighting' },
        climateHallway: { baseCost: 25,  unit: 'per_sqft',   description: 'Climate hallway interior' },
        hvac:           { baseCost: 10,  unit: 'per_sqft',   avgUnitSize: 100, description: 'HVAC / climate control' },
        unitInterior:   { baseCost: 200, unit: 'per_unit',   defaultCount: 'totalUnits', description: 'Unit interior repairs' },
        exteriorPaint:  { baseCost: 3,   unit: 'per_sqft',   description: 'Exterior paint / cladding' },
        gate:          { amounts: [0, 4000, 8000, 12000, 20000],        unit: 'dropdown', description: 'Gate / motor' },
        accessControl: { amounts: [0, 2000, 5000, 10000, 20000],        unit: 'dropdown', description: 'Access control' },
        office:        { amounts: [0, 2500, 5000, 10000, 15000],        unit: 'dropdown', description: 'Office buildout' },
        signage:       { amounts: [0, 1500, 3000, 5000, 10000],         unit: 'dropdown', description: 'Signage' },
        siteWork:      { amounts: [0, 2500, 5000, 10000, 20000, 40000], unit: 'dropdown', description: 'Site work / drainage' }
      }
    },

    // ── COMMERCIAL rehab systems (homed 2026-07-22; 2026 national averages) ──
    commercial: {
      systems: {
        interior:   { baseCost: 60, unit: 'per_sqft', description: 'Interior buildout / TI' },
        roof:       { baseCost: 12, unit: 'per_sqft', description: 'Roof' },
        hvac:       { baseCost: 18, unit: 'per_sqft', description: 'HVAC' },
        electrical: { baseCost: 8,  unit: 'per_sqft', description: 'Electrical' },
        facade:     { baseCost: 15, unit: 'per_sqft', description: 'Facade / exterior' },
        parking:    { amounts: [0, 5000, 15000, 30000, 60000, 100000], unit: 'dropdown', description: 'Parking lot' },
        plumbing:   { amounts: [0, 5000, 15000, 30000, 60000, 120000], unit: 'dropdown', description: 'Plumbing' },
        storefront: { amounts: [0, 5000, 15000, 30000, 60000],         unit: 'dropdown', description: 'Storefront / glazing' },
        signage:    { amounts: [0, 2500, 7500, 15000, 30000],          unit: 'dropdown', description: 'Signage' },
        siteWork:   { amounts: [0, 10000, 25000, 50000, 100000],       unit: 'dropdown', description: 'Site work / drainage' }
      }
    },

    // ── Geometry / area models (homed 2026-07-22) ──
    // Construction geometry, not cost tables — but homed so NO app carries a bare
    // literal. Applied to the per-area rehab formulas (siding, roof, windows, HVAC).
    geometry: {
      sidingPerimeterFactor: 4.5,     // sqrt(footprint) x this ~= perimeter
      sidingWallHeight: 9,            // ft per story
      sidingGableFactor: 1.10,        // gable / waste uplift
      roofPitchMultiplier: 1.12,     // footprint x this ~= roof area
      defaultWindowCount: 20,        // residential windows starting count
      storageHvacAvgUnitSize: 100,   // sqft per climate unit
      storageCameraDefaultCount: 8,
      storagePoleLightDefaultCount: 4
    },

    // ── Rehab breakdown allocation (homed 2026-07-22 from rei-auto-offer) ──
    // How a whole-house rehab total SPLITS across categories per condition, for
    // display. Percentages per tier sum to 1.0; they move no money, only label the
    // split. Was hardcoded in auto-offer getRehabBreakdown().
    itemAllocation: {
      move_in:      { paint_cosmetics: 0.4, flooring_minor: 0.3, fixtures_updates: 0.3 },
      light_rehab:  { flooring: 0.25, paint_cosmetics: 0.2, kitchen_updates: 0.25, bathroom_fixtures: 0.15, electrical_minor: 0.15 },
      medium_rehab: { kitchen_remodel: 0.25, roof: 0.15, flooring: 0.2, hvac: 0.1, bathroom_fixtures: 0.15, paint_cosmetics: 0.08, electrical_updates: 0.07 },
      heavy_rehab:  { kitchen_remodel: 0.2, roof: 0.15, flooring: 0.2, hvac: 0.12, bathroom_fixtures: 0.15, electrical_rewire: 0.08, plumbing: 0.05, paint_cosmetics: 0.05 },
      studs:        { kitchen_full: 0.15, roof: 0.1, flooring_new: 0.15, hvac: 0.1, electrical_full: 0.1, plumbing_full: 0.1, bathrooms_new: 0.15, drywall_insulation: 0.1, paint_finish: 0.05 }
    },

    description: 'All rehab pricing from REI Platform Bible v11.23 Section 5 (source of truth for rehab costs)'
  },

  // ============================================================================
  // REFINANCE (takeout / cash-out assumptions)
  // Restored to the Bible 2026-07-16 (were orphaned in bible-reader, no home here).
  // ============================================================================
  REFI: {
    mortgageRate: 0.0725,                 // 7.25% refi takeout rate
    amortizationYears: 15,                // 15yr refi amortization
  },

  // ============================================================================
  // GROWTH ASSUMPTIONS (multi-year projections)
  // Restored to the Bible 2026-07-16 (were orphaned in bible-reader, no home here).
  // ============================================================================
  GROWTH: {
    noiConservative: 0.03,                // 3% annual NOI growth (conservative)
    noiStretch: 0.05,                     // 5% annual NOI growth (stretch)
    expenseAnnual: 0.0235,                // 2.35% annual expense growth
  },

  // ============================================================================
  // VERSION & METADATA
  // ============================================================================

  META: {
    version: '11.25',
    bibleVersion: 'REI_PLATFORM_BIBLE_v11_25',
    bibleSourceFile: 'REI_PLATFORM_BIBLE_v11_25.{md,json,yaml}',
    date_last_updated: '2026-07-13',
    authority: 'Stephen Franco / GPGH Equities / Gorilla Real Estate',
    integrations: [
      'rei-rehab-calc (rehab systems)',
      'rei-auto-offer (four-tier offers + seller finance)',
      'Baby Analyzer',
      'Lender Command',
      'Deal Analyzer',
      'Net Sheet',
      'Comp Snapshot',
      'Lending Intake',
      'Report Engine',
      'rei-risk-intelligence',
      'rei-inspection',
      'rei-appraisal',
      'all 35+ REI platform services'
    ],
    critical_rules: [
      'ALL TOOLS READ THIS FILE ON EVERY RUN',
      'Do not hardcode numbers. Read from this Bible.',
      'Rehab: $15/SF cosmetic base × condition multiplier (not $110/SF studs)',
      'Seller finance: $100k buyer cash, 5%, 25yr amort, 15yr balloon',
      'Four offer tiers: List, Direct (−$10k), Fast Cash (−$20k), Cash MAO (70%)',
      'Residential pads: 0%, 15%, 30% (not 20%, 33%)',
      'Residential DSCR: 1.25 only (not 1.15)',
      'Storage/commercial scenario matrix: exactly 10 (6 conventional groupA + 2 seller-note groupB + 2 seller-kicker groupC)',
      'Retired: B1, B2, B3 legacy rows (superseded by the groupA/B/C 10-scenario matrix)',
      'NOI multipliers: Storage 12.5x, MHP 12.5x, RV 13x, IOS 14x'
    ]
  }
};

// ============================================================================
// EXPORT
// ============================================================================

module.exports = PLATFORM_UNDERWRITING_STANDARDS;
