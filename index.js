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
    waltMinYears: 3,                      // weighted-average lease term below this = warning
    repositionVacancyThreshold: 0.20,     // physical vacancy above this = reposition play
    topTenantRolloverWarnMonths: 12,      // top tenant rolling within this = warning
    mgCamRecoveryShare: 0.50,             // modified-gross leases recover ~50% of CAM

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
