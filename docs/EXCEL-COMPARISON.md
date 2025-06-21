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

### 2. Service-by-Service Breakdown

#### Telemedicina
- **Excel Calculation:** 0.02 × 587 × 4.5 × 1 = 52.83
- **TypeScript:** `calculateServicePremium('Telemedicina', 'oro')`
- **Validation:** ✅ Exact match

#### Orientación Médica Telefónica  
- **Excel Calculation:** 0.01 × 90.467 × 4.5 × 1 = 4.071
- **TypeScript:** `calculateServicePremium('Orientación Medica Telefónica', 'oro')`
- **Validation:** ✅ Exact match

#### Asistencia de Urgencia Hospitalaria
- **Excel Calculation:** 0.01 × 2000 × 4.5 × 1 = 90
- **TypeScript:** `calculateServicePremium('Asistencia de Urgencia Hospitalaria', 'oro')`
- **Validation:** ✅ Exact match

### 3. Plan Factor Validation

| Service | Plata Factor | Oro Factor | Diamante Factor |
|---------|--------------|------------|-----------------|
| Telemedicina | 1.0 | 1.0 | 1.0 |
| Médico a Domicilio | 1.0 | 1.2 | 1.5 |
| Urgencia Hospitalaria | 0.0 | 1.0 | 1.5 |
| Pruebas Diagnósticas | 0.0 | 1.0 | 1.25 |
| Asistencia Funeraria | 0.0 | 1.0 | 1.5 |

### 4. Age Factor Validation

**Excel Logic:**
- Cells I15 (age <70): Base calculation
- Cells I20 (age ≥70): Base calculation × 2

**TypeScript Validation:**
```typescript
// Age 69 (under 70)
const under70 = engine.calculatePremium({age: 69, includeParents: false}, 'oro', {});
expect(under70.ageAdjustment).toBe(0);

// Age 70 (over 70)  
const over70 = engine.calculatePremium({age: 70, includeParents: false}, 'oro', {});
expect(over70.totalAnnual).toBeCloseTo(under70.totalAnnual * 2, 1);
```

### 5. Family Factor Validation

**Excel Logic:**
- Individual: Factor 1.0
- With Parents: Factor 1.8

**Excel Cell I18:** Shows additional premium for family coverage

### 6. Optional Services Validation

#### Asistencia Funeraria
- **Base Premium (Excel I16):** 135
- **With Optional Factor:** 135 × 1.25 = 168.75
- **TypeScript Validation:** ✅ Match

#### TeleVet  
- **Base Premium (Excel I17):** 52.83
- **With Optional Factor:** 52.83 × 1.25 = 66.04
- **TypeScript Validation:** ✅ Match

### 7. Final Calculation Factors

**Excel Implementation:**
- Gastos: 20% (Row 16, Column C)
- Utilidad: 15% (Row 17, Column C)  
- Comisión: 30% (Row 18, Column C)
- Factor Familiar: 1.8 (Row 19, Column C)
- Factor Opcional: 1.25 (Row 20, Column C)

**TypeScript Implementation:**
```typescript
const CALCULATION_FACTORS = {
  expenses: 0.2,      // 20%
  profit: 0.15,       // 15%  
  commission: 0.3,    // 30%
  familyFactor: 1.8,  // 1.8x
  optionalFactor: 1.25 // 1.25x
};
```

## Validation Results Summary

### Test Cases Validated

| Test Case | Excel Value | TypeScript Value | Difference | Status |
|-----------|-------------|------------------|------------|--------|
| Base Case Annual | 1213.5239446936341 | 1213.52 | <0.01 | ✅ PASS |
| Base Case Monthly | 101.12699539113618 | 101.13 | <0.01 | ✅ PASS |
| Plan Diamante | 1518.6680630818535 | 1518.67 | <0.01 | ✅ PASS |
| Age Factor (75y) | 2427.0478893872682 | 2427.05 | <0.01 | ✅ PASS |
| Funeral Service | 168.75 | 168.75 | 0.00 | ✅ PASS |
| TeleVet Service | 66.0375 | 66.04 | <0.01 | ✅ PASS |

### Coverage Validation

| Plan | Services Included | Excel Count | TypeScript Count | Status |
|------|------------------|-------------|------------------|--------|
| Plata | Basic only | 5 | 5 | ✅ PASS |
| Oro | Basic + Premium | 9 | 9 | ✅ PASS |
| Diamante | All services | 9 | 9 | ✅ PASS |

## Tolerance Settings

- **Default Tolerance:** ±$0.01
- **Percentage Tolerance:** ±0.001%
- **Critical Tests:** Must be exact within tolerance
- **Non-critical Tests:** Allowed minor rounding differences

## Validation Process

### Automated Validation
```bash
npm run validate
```

**Process:**
1. Load Excel expected values
2. Calculate using TypeScript engine
3. Compare results within tolerance
4. Report pass/fail status
5. Log detailed differences

### Manual Validation Steps
1. **Open Excel file:** `MIA Health IMASS.xlsx`
2. **Set inputs:** Age=69, Plan=Oro, Parents=No
3. **Record outputs:** Annual/Monthly premiums
4. **Run TypeScript:** With same inputs
5. **Compare:** Results should match within $0.01

### Debugging Validation Failures

If validation fails:

1. **Check Input Parameters:**
   ```typescript
   console.log('Input:', { age, plan, includeParents, optionalServices });
   ```

2. **Enable Detailed Breakdown:**
   ```typescript
   const result = engine.calculatePremium(applicant, plan, options, true);
   console.log('Steps:', result.calculationSteps);
   ```

3. **Compare Service by Service:**
   ```typescript
   const services = engine.getServicesConfiguration();
   services.forEach(service => {
     const premium = engine.calculateServicePremium(service, plan);
     console.log(`${service.name}: ${premium}`);
   });
   ```

4. **Verify Excel Formulas:**
   - Check cell references
   - Verify calculation order
   - Confirm factor values

## Known Discrepancies

### Rounding Differences
- **Source:** Excel uses different rounding precision
- **Impact:** <$0.01 in final calculations
- **Resolution:** Acceptable within tolerance

### Formula Variations
- **Source:** Excel intermediate calculations vs direct TypeScript
- **Impact:** Negligible (<0.001%)
- **Resolution:** Both methods mathematically equivalent

## Maintenance

### When Excel Changes
1. **Update expected values** in validation file
2. **Re-run validation tests**
3. **Update service configurations** if needed
4. **Document changes** in this file

### Adding New Test Cases
1. **Identify Excel scenario**
2. **Extract expected values**
3. **Add to validation suite**
4. **Verify passes within tolerance**

---
