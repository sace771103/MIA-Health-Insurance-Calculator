# ARCHIVO 25: docs/EXCEL-COMPARISON.md
# Excel Comparison Documentation

## Overview

This document details how the TypeScript calculation engine compares against the original Excel memory calculation file.

## Excel File Structure

### Worksheet: "Planes Salud"
- **Purpose:** Product definition and user interface
- **Key Cells:**
  - `H2:I2`: Input age (69)
  - `H3:I3`: Selected plan ("Oro")
  - `H4:I4`: Include parents toggle (FALSE)
  - `I6`: Annual premium (1213.5239446936341)
  - `I7`: Monthly premium (101.12699539113618)

### Worksheet: "Bases"
- **Purpose:** Calculation engine and memory
- **Structure:**
  - Columns A-E: Service definitions and calculations
  - Columns G-K: Plan factors and coverage details
  - Rows 15-29: Final premium calculations by scenario

## Key Validation Points

### 1. Base Case Validation
**Excel Values:**
- Age: 69 years
- Plan: Oro
- Include Parents: No
- Optional Services: None
- **Expected Annual Premium:** $1,213.52
- **Expected Monthly Premium:** $101.13

**TypeScript Validation:**
```typescript
const result = engine.calculatePremium(
  { age: 69, includeParents: false },
  'oro',
  { funeralAssistance: false, teleVet: false }
);

expect(result.totalAnnual).toBeCloseTo(1213.5239446936341, 2);
expect(result.totalMonthly).toBeCloseTo(101.12699539113618, 2);
```

### 
