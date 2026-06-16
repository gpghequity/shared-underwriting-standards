/**
 * PLATFORM_UNDERWRITING_STANDARDS
 *
 * SINGLE SOURCE OF TRUTH for all REI platform underwriting assumptions.
 * Used across: Baby Analyzer, Lender Command, Auto Offer, Deal Analyzer, Net Sheet,
 * Comp Snapshot, Lending Intake, Report Engine, Vendor Directory Scoring
 * (Fast Calc excluded — standalone giveaway with embedded constants)
 *
 * Source: PLATFORM_UNDERWRITING_BIBLE_v9 (2026-06-15)
 * Authority: Stephen Franco
 * Last Verified: 2026-06-15
 * Last Modified: 2026-06-15 (v9: integrated rei-rehab-calc systems + three-tier offer fees)
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
    hardModeFormula: '(NOI / 1.25 - rehab - closing) / (0.8 * K + rate)',

    // Offer types
    cashAsIs: {
      formula: 'ARV × 0.70 - rehab_estimate',
      description: 'Cash offer for as-is property',
      requiresARV: true
    },

    termsOffer: {
      downPaymentPercent: 0.10,           // 10% down
      interestRate: 0.05,                 // 5% APR
      balloonYears: 7,                    // Balloon in 7 years
      amortizationYears: 30,              // Payments calculated over 30yr
      formula: 'seller_note_principal = (NOI / 1.25 - bank_DS - closing); monthly_payment = principal * K_SELLER(5%, 30yr)',
      description: 'Seller-financed offer'
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

    // CONDITION-TIER REHAB PSF (Fallback if no research data)
    // These are only used if Remodeling Magazine benchmark unavailable
    conditionRehabPSF: {
      move_in: 5,                          // Move-in ready: $5/sqft
      light_rehab: 25,                     // Light rehab: $25/sqft
      medium_rehab: 45,                    // Medium rehab: $45/sqft
      heavy_rehab: 75,                     // Heavy rehab: $75/sqft
      studs: 110                           // Studs: $110/sqft (gut rehab)
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

    // Subclass-specific cap rates and vacancy floors
    subclasses: {
      retailStrip: { capRate: 0.08, vacancyFloor: 0.10, comments: 'Single-tenant or multi-tenant' },
      singleTenant: { capRate: 0.07, vacancyFloor: 0.05, comments: 'Credit tenant preferred' },
      officeGeneral: { capRate: 0.085, vacancyFloor: 0.12, comments: 'Class A/B/C varies' },
      officeMedical: { capRate: 0.085, vacancyFloor: 0.08, comments: 'Typically longer leases' },
      industrialFlex: { capRate: 0.075, vacancyFloor: 0.08, comments: '3PL, last-mile' },
      warehouse: { capRate: 0.065, vacancyFloor: 0.05, comments: 'Modern specs premium' },
      mixedUse: { capRate: null, vacancyFloor: 0.10, comments: 'Blended by tenant mix' },
      restaurant: { capRate: 0.10, vacancyFloor: 0.00, comments: 'Triple-net or proprietor' },
      carwash: { capRate: 0.095, vacancyFloor: 0.00, comments: 'High-margin, service' },
      specialPurpose: { capRate: null, vacancyFloor: null, comments: 'Case-by-case' }
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
  }
};

  // ============================================================================
  // REHAB SYSTEMS (from rei-rehab-calc v2.0) — Bible v9
  // ============================================================================

  REHAB: {
    // Condition tier cost multipliers (applied to base costs)
    tiers: {
      new: 0.00,
      modern: 0.25,
      semiModern: 0.50,
      old: 0.80,
      missing: 1.00,
      drywallNeeded: 2.00,
      studdedOut: 3.00
    },

    // System-by-system base costs (from rei-rehab-calc)
    systems: {
      cosmetic: { baseCost: 15, unit: 'per_sqft', description: 'Paint, flooring, cosmetics' },
      windows: { baseCost: 350, unit: 'per_window', description: 'Window replacement' },
      roof: { formula: 'footprint × pitch × $7/sqft', description: 'Roofing' },
      kitchen: { tiers: { new: 0, modern: 2000, semiModern: 4000, old: 7000, missing: 10000 }, unit: 'per_unit' },
      fullBath: { tiers: { new: 0, modern: 1500, semiModern: 2500, old: 4000, missing: 6000 }, unit: 'per_bath' },
      halfBath: { tiers: { new: 0, modern: 800, semiModern: 1500, old: 2500, missing: 4500 }, unit: 'per_bath' },
      threeQtrBath: { tiers: { new: 0, modern: 1000, semiModern: 2000, old: 3000, missing: 5000 }, unit: 'per_bath' },
      appliances: { tiers: { new: 0, modern: 400, semiModern: 700, old: 1500, missing: 1800 }, unit: 'per_unit' },
      exterior: { amounts: [0, 500, 1500, 2500, 5000, 8000, 10000], unit: 'dropdown' },
      porch: { amounts: [0, 500, 1500, 2500, 5000, 8000, 10000], unit: 'dropdown' },
      basement: { amounts: [0, 500, 1500, 2500, 5000, 8000, 10000], unit: 'dropdown' },
      furnace: { amounts: [0, 1000, 2000, 3000, 6000, 10000], unit: 'dropdown' },
      plumbing: { amounts: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000], unit: 'dropdown' },
      electrical: { amounts: [0, 500, 1000, 2000, 4000, 6000, 8000], unit: 'dropdown' },
      holding: { amounts: [0, 200, 500, 1000, 1500, 3000, 5000], unit: 'per_month', description: 'Carrying costs' }
    },

    description: 'All rehab pricing from rei-rehab-calc v2.0 (source of truth for rehab costs)'
  },

  // ============================================================================
  // VERSION & METADATA
  // ============================================================================

  META: {
    version: '9.0',
    bibleVersion: 'PLATFORM_UNDERWRITING_BIBLE_v9',
    date_last_updated: '2026-06-15',
    authority: 'Stephen Franco',
    integrations: [
      'rei-rehab-calc (rehab systems)',
      'rei-auto-offer (three-tier offers)',
      'Baby Analyzer',
      'Lender Command',
      'Deal Analyzer',
      'Net Sheet',
      'Comp Snapshot',
      'Lending Intake',
      'Report Engine'
    ],
    critical_rules: [
      'ALL TOOLS READ THIS FILE ON EVERY RUN',
      'Do not hardcode numbers. Read from this Bible.',
      'Rehab source: rei-rehab-calc. Do not copy into tool code.',
      'Three-offer tiers: Retail, Direct Investor (−$10k), Fastest Cash (−$20k)',
      'NOI multipliers: Storage 12.5x, MHP 12.5x, RV 13x, IOS 14x'
    ]
  }
};

// ============================================================================
// EXPORT
// ============================================================================

module.exports = PLATFORM_UNDERWRITING_STANDARDS;
