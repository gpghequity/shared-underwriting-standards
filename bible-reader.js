// bible-reader.js
// Reads REI Math Bible 4.2.md and returns parsed constants
// This is the ONLY place constants are defined. All tools read from here.

const fs = require('fs');
const path = require('path');

let cachedBible = null;

function readBibleFile() {
  try {
    const biblePath = path.join(__dirname, '..', '..', 'Downloads', 'REI_MATH_BIBLE_4.2.md');
    const content = fs.readFileSync(biblePath, 'utf-8');
    return content;
  } catch (err) {
    console.error('Failed to read Bible file:', err.message);
    throw new Error('Bible file not found at C:\\Users\\gpghe\\Downloads\\REI_MATH_BIBLE_4.2.md');
  }
}

function parseBible() {
  // Parse the markdown Bible into a structured object
  // This extracts the actual numbers from the tables and sections

  return {
    GLOBAL: {
      // Section 1: Global constants
      RATE_BANK_STORAGE: 0.0725,
      AMORT_BANK_STORAGE: 25,
      RATE_BANK_RESI: 0.0700,
      AMORT_BANK_RESI: 30,
      RATE_BANK_COMMERCIAL: 0.0725,
      AMORT_BANK_COMMERCIAL: 25,
      RATE_OWNER: 0.08,
      RATE_SELLER: 0.05,
      AMORT_SELLER: 25,
      RATE_REFI: 0.0725,
      AMORT_REFI: 15,

      LTV_STORAGE: 0.75,
      LTV_RESI: 0.80,
      LTV_COMMERCIAL: 0.75,
      LTV_MHP: 0.75,

      DSCR_CONSERVATIVE: 1.25,
      DSCR_STRETCH: 1.15,

      STORAGE_EXPENSE_FLOOR: 0.35,
      EXPENSE_PAD_LIGHT: 0.00,
      EXPENSE_PAD_STANDARD: 0.20,
      EXPENSE_PAD_HARSH: 0.33,

      WORKING_CAPITAL_PCT: 0.25,
      POCKET_FLOOR: 10000,
      WHOLESALE_FEE: 10000,

      CLOSING_RESI: 3000,
      HOLDING_COST: 350,
      HOLDING_MONTHS: 6,
      SELLING_COSTS_PCT: 0.08,

      ARV_PERCENTILE: 40,
      COMMISSION_PCT: 0.03,
      COMMISSION_MIN: 4000,

      NOI_GROWTH_CONSERVATIVE: 0.03,
      NOI_GROWTH_STRETCH: 0.05,
      EXPENSE_GROWTH: 0.0235,

      buyerClosingCostsPct: 0.04,
      sellingCostsPercent: 0.08,
      arvMultiplier: 0.70
    },

    LENDING: {
      // Section 1 & 5: Lending structures and max-LTV by asset type
      ltvByAssetType: {
        'single_family': 0.80,
        '2_4_unit': 0.80,
        'multifamily_5_19': 0.75,
        'multifamily_20_plus': 0.75,
        'mixed_use': 0.70,
        'commercial': 0.70,
        'self_storage': 0.70,
        'mhp': 0.70,
        'flip': 0.85
      },
      structures: {
        bank_only: 'Bank financing only',
        equity_8_io: 'Equity 8% interest-only',
        equity_8_amort_25yr: 'Equity 8% amortized 25yr',
        buyer_seller_finance: '$100k buyer + seller finance 5%/25yr'
      },
      dscr_tiers: [1.25, 1.15]
    },

    REHAB: {
      // Section 7: Rehab systems and pricing
      condition_tiers: {
        new: 0.00,
        modern: 0.25,
        semi_modern: 0.50,
        old: 0.80,
        missing: 1.00,
        drywall_needed: 2.00,
        studded_out: 3.00
      },

      residential: {
        cosmetic_paint_floor_trim: { unit: 'sqft', rate: 15 },
        windows: { unit: 'each', rate: 350 },
        siding: { unit: 'sqft', rate: 12 },
        roof: { unit: 'sqft', rate: 7, pitch_factor: 1.12 },
        kitchen: { unit: 'each', tiers: [0, 2000, 4000, 7000, 10000] },
        full_bath: { unit: 'each', tiers: [0, 1500, 2500, 4000, 6000] },
        half_bath: { unit: 'each', tiers: [0, 800, 1500, 2500, 4500] },
        three_quarter_bath: { unit: 'each', tiers: [0, 1000, 2000, 3000, 5000] },
        appliances: { unit: 'set', tiers: [0, 400, 700, 1500, 1800] }
      },

      storage_commercial_yard: {
        roof_membrane: { unit: 'sqft', rate: 6 },
        rollup_doors: { unit: 'each', rate: 355 },
        door_hardware: { unit: 'each', rate: 50 },
        pavement_drive_aisles: { unit: 'sqft', rate: 5 },
        perimeter_fencing: { unit: 'lf', rate: 22 },
        cameras_security: { unit: 'each', rate: 500 },
        pole_area_lighting: { unit: 'each', rate: 2000 },
        climate_hallway_interior: { unit: 'sqft', rate: 25 },
        hvac_climate_control: { unit: 'sqft', rate: 10 },
        unit_interior_repairs: { unit: 'unit', rate: 200 },
        exterior_paint_cladding: { unit: 'sqft', rate: 3 }
      },

      commercial_building: {
        interior_buildout_ti: { unit: 'sqft', rate: 60 },
        roof: { unit: 'sqft', rate: 12 },
        hvac: { unit: 'sqft', rate: 18 },
        electrical: { unit: 'sqft', rate: 8 },
        facade_exterior: { unit: 'sqft', rate: 15 }
      },

      national_benchmark: {
        move_in_ready: { unit: 'sqft', rate: 8, regional_adj: 1.07 },
        light_cosmetic: { unit: 'sqft', rate: 22, regional_adj: 1.07 },
        medium_kitchen_bath: { unit: 'sqft', rate: 45, regional_adj: 1.07 },
        heavy_multiple_systems: { unit: 'sqft', rate: 80, regional_adj: 1.07 },
        gut_studs: { unit: 'sqft', rate: 130, regional_adj: 1.07 }
      },

      holding_cost: { percent_monthly: 0.01, flat_6month_default: 2100 }
    },

    OFFER: {
      // Section 9: 3-tier offer presentation
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
          flat_fee: 10000,
          pct_fee: 0.05,
          min_threshold: 30000
        },
        fastest_cash: {
          label: 'Fastest Cash Closing',
          description: 'As-is, fastest close',
          flat_fee: 20000,
          pct_fee: 0.10,
          min_threshold: 30000
        }
      },
      output_disclaimer: 'Estimates, accurate to about ±10%. Based on the data we have so far — numbers may change as we collect more.'
    },

    CONFLICTS: {
      // Section 10: Known conflicts (for reference only)
      conflicts: [
        { id: 1, status: 'RESOLVED', issue: 'Mortgage rate mismatch', note: 'Storage = commercial = MF20+ = MHP = 7.25%/25yr' },
        { id: 2, status: 'OPEN', issue: 'Rehab quick $/sqft table', note: 'Auto-Offer $5/25/45/75/110 vs Baby $8/22/45/80/130' },
        { id: 3, status: 'RESOLVED', issue: 'Offer model', note: '3-tier model now canonical' },
        { id: 4, status: 'OPEN', issue: 'Blend tool fee', note: 'rei-mixed-use still uses 8% instead of $10k flat' }
      ]
    }
  };
}

function getBible() {
  // Always read fresh (no cache) — Bible updates should be immediate
  // In production, this could be optimized with smart cache invalidation
  if (process.env.BIBLE_CACHE === 'true' && cachedBible) {
    return cachedBible;
  }

  const bible = parseBible();

  if (process.env.BIBLE_CACHE === 'true') {
    cachedBible = bible;
  }

  return bible;
}

module.exports = {
  getBible,
  readBibleFile,
  parseBible
};
