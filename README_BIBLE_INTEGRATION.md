# Bible Integration Guide

## What Is the Bible?

The **Math Bible** (`REI_MATH_BIBLE_4.2.md`) is the single canonical source of truth for all underwriting math across the REI platform.

Location: `C:\Users\gpghe\Downloads\REI_MATH_BIBLE_4.2.md`

## How Services Should Use It

**Every service that does math MUST read from the Bible, not keep its own copy.**

### Step 1: Require the Bible Reader

```javascript
const { getBible } = require('shared-underwriting-standards/bible-reader');
const BIBLE = getBible();
```

### Step 2: Read Constants at Runtime

```javascript
// ✓ CORRECT: Read at runtime
const dscr = BIBLE.GLOBAL.DSCR_STRETCH;  // 1.15
const fee = BIBLE.GLOBAL.WHOLESALE_FEE;  // 10000

// ✗ WRONG: Local copy (forbidden)
const dscr = 1.10;
const fee = arv * 0.08;
```

### Step 3: Use Bible Values in Calculations

```javascript
function maxOffer(arv, rehab) {
  return (arv * BIBLE.GLOBAL.arvMultiplier) - rehab - BIBLE.GLOBAL.WHOLESALE_FEE;
}
```

## What's in the Bible?

### Section 1: Global Constants
- Rates: `RATE_BANK_STORAGE`, `RATE_BANK_RESI`, `RATE_OWNER`, etc.
- LTVs: `LTV_STORAGE`, `LTV_RESI`, `LTV_COMMERCIAL`, etc.
- DSCR: `DSCR_CONSERVATIVE` (1.25), `DSCR_STRETCH` (1.15)
- Fees: `WHOLESALE_FEE` ($10,000)
- Expense floor: `STORAGE_EXPENSE_FLOOR` (0.35)

### Section 5: Lending Matrix
- Max LTV by asset type
- Financing structures (bank only, equity IO, equity amort, seller finance)
- DSCR tiers

### Section 7: Rehab Math
- Condition tiers (New, Modern, Old, Missing, etc.)
- Residential systems (kitchen, bath, roof, windows, etc.) with locked rates
- Storage systems (doors, fencing, HVAC, etc.) with locked rates
- Commercial systems (TI, roof, HVAC, electrical, facade)
- National benchmarks (per sqft, by condition)

### Section 9: Offer Presentation
- 3-tier offers (Retail, Direct Investor, Fastest Cash)
- Formula: Retail = highest Bible value − rehab
- Tiers come down from Retail by flat fees or percentages

## Bible Reader API

```javascript
const { getBible } = require('shared-underwriting-standards/bible-reader');

const BIBLE = getBible();  // Returns full structured object

// Access sections:
BIBLE.GLOBAL       // Section 1: global constants
BIBLE.LENDING      // Section 5: lending matrix
BIBLE.REHAB        // Section 7: rehab math
BIBLE.OFFER        // Section 9: offer presentation
BIBLE.CONFLICTS    // Section 10: known conflicts (reference only)
```

## Services Updated

✅ **baby-analyzer**: Reads DSCR_STRETCH from Bible (1.15, fixed from 1.10)  
✅ **mixed-use**: Reads WHOLESALE_FEE from Bible ($10k flat, fixed from 8%)  
✅ **transactional-lending**: Added Bible import for lending math  

## Next: Audit Remaining Services

All services that do math must:
1. Add `require('shared-underwriting-standards/bible-reader')`
2. Replace hardcoded constants with `BIBLE.GLOBAL.*`
3. Run tests to verify
4. Commit with message: "feat: read [constants] from Bible at runtime"

See the Bible Documentation (§0a) for the complete rule:
> "Tools do not keep their own copy of these numbers. Every tool reads from the one shared source."
