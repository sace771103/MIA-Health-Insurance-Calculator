
# ARCHIVO 9: src/scripts/run-validation.ts
import MIAHealthCalculationEngine, { PlanType } from '../engines/premium-calculation-engine.js';

// Valores exactos del Excel para validación
const EXCEL_EXPECTED_VALUES = {
  baseCase: {
    input: { age: 69, plan: 'oro' as PlanType, includeParents: false, optionalServices: { funeralAssistance: false, teleVet: false }},
    expected: { totalAnnual: 1213.5239446936341, totalMonthly: 101.12699539113618 }
  },
  diamondCase: {
    input: { age: 69, plan: 'diamante' as PlanType, includeParents: false, optionalServices: { funeralAssistance: false, teleVet: false }},
    expected: { totalAnnual: 1518.6680630818535 }
  },
  ageFactorCase: {
    input: { age: 75, plan: 'oro' as PlanType, includeParents: false, optionalServices: { funeralAssistance: false, teleVet: false }},
    expected: { totalAnnual: 2427.0478893872682 }
  }
};

interface ValidationResult {
  testName: string;
  passed: boolean;
  expected: number;
  calculated: number;
  difference: number;
  critical: boolean;
}

class LiveValidator {
  private engine: MIAHealthCalculationEngine;
  private
