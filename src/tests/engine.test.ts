# ARCHIVO 19: src/tests/engine.test.ts
import MIAHealthCalculationEngine from '../engines/premium-calculation-engine.js';

describe('MIA Health Calculation Engine', () => {
  let engine: MIAHealthCalculationEngine;

  beforeEach(() => {
    engine = new MIAHealthCalculationEngine();
  });

  describe('Age Validation', () => {
    test('should accept valid ages', () => {
      expect(engine.validateAge(25).valid).toBe(true);
      expect(engine.validateAge(45).valid).toBe(true);
      expect(engine.validateAge(69).valid).toBe(true);
      expect(engine.validateAge(80).valid).toBe(true);
    });

    test('should reject invalid ages', () => {
      expect(engine.validateAge(17).valid).toBe(false);
      expect(engine.validateAge(81).valid).toBe(false);
      expect(engine.validateAge(0).valid).toBe(false);
      expect(engine.validateAge(-5).valid).toBe(false);
    });

    test('should provide appropriate error messages', () => {
      const tooYoung = engine.validateAge(17);
      const tooOld = engine.validateAge(81);
      
      expect(tooYoung.message).toContain('mínima es 18');
      expect(tooOld.message).toContain('máxima es 80');
    });
  });

  describe('Basic Premium Calculations', () => {
    test('should calculate correct premium for base case (69, oro)', () => {
      const result = engine.calculatePremium(
        { age: 69, includeParents: false },
        'oro',
        { funeralAssistance: false, teleVet: false }
      );

      // Values from Excel validation
      expect(result.totalAnnual).toBeCloseTo(1213.52, 1);
      expect(result.totalMonthly).toBeCloseTo(101.13, 1);
    });

    test('should calculate monthly as annual/12', () => {
      const result = engine.calculatePremium(
        { age: 35, includeParents: false },
        'oro',
        { funeralAssistance: false, teleVet: false }
      );

      const expectedMonthly = result.totalAnnual / 12;
      expect(result.totalMonthly).toBeCloseTo(expectedMonthly, 2);
    });

    test('should handle all plan types', () => {
      const applicant = { age: 45, includeParents: false };
      const options = { funeralAssistance: false, teleVet: false };

      const plata = engine.calculatePremium(applicant, 'plata', options);
      const oro = engine.calculatePremium(applicant, 'oro', options);
      const diamante = engine.calculatePremium(applicant, 'diamante', options);

      expect(plata.totalAnnual).toBeGreaterThan(0);
      expect(oro.totalAnnual).toBeGreaterThan(plata.totalAnnual);
      expect(diamante.totalAnnual).toBeGreaterThan(oro.totalAnnual);
    });
  });

  describe('Age Factor Calculations', () => {
    test('should apply 2x factor for age >= 70', () => {
      const under70 = engine.calculatePremium(
        { age: 69, includeParents: false },
        'oro',
        { funeralAssistance: false, teleVet: false }
      );

      const over70 = engine.calculatePremium(
        { age: 70, includeParents: false },
        'oro',
        { funeralAssistance: false, teleVet: false }
      );

      // Should be approximately 2x (considering rounding)
      const ratio = over70.totalAnnual / under70.totalAnnual;
      expect(ratio).toBeCloseTo(2.0, 1);
    });

    test('should not apply age factor for age < 70', () => {
      const result = engine.calculatePremium(
        { age: 35, includeParents: false },
        'oro',
        { funeralAssistance: false, teleVet: false }
      );

      expect(result.ageAdjustment).toBe(0);
    });
  });

  describe('Family Factor Calculations', () => {
    test('should apply 1.8x factor when including parents', () => {
      const individual = engine.calculatePremium(
        { age: 45, includeParents: false },
        'oro',
        { funeralAssistance: false, teleVet: false }
      );

      const family = engine.calculatePremium(
        { age: 45, includeParents: true },
        'oro',
        { funeralAssistance: false, teleVet: false }
      );

      const expectedFamilyAdjustment = individual.totalAnnual * 0.8; // 1.8x - 1.0x = 0.8x
      expect(family.familyAdjustment).toBeCloseTo(expectedFamilyAdjustment, 1);
    });

    test('should not apply family factor when not including parents', () => {
      const result = engine.calculatePremium(
        { age: 45, includeParents: false },
        'oro',
        { funeralAssistance: false, teleVet: false }
      );

      expect(result.familyAdjustment).toBe(0);
    });
  });

  describe('Optional Services', () => {
    test('should calculate funeral assistance premium correctly', () => {
      const withoutFuneral = engine.calculatePremium(
        { age: 69, includeParents: false },
        'oro',
        { funeralAssistance: false, teleVet: false }
      );

      const withFuneral = engine.calculatePremium(
        { age: 69, includeParents: false },
        'oro',
        { funeralAssistance: true, teleVet: false }
      );

      // Should include funeral assistance with optional factor
      expect(withFuneral.optionalsPremium).toBeCloseTo(168.75, 1); // 135 * 1.25
      expect(withFuneral.totalAnnual).toBeGreaterThan(withoutFuneral.totalAnnual);
    });

    test('should calculate TeleVet premium correctly', () => {
      const withoutTeleVet = engine.calculatePremium(
        { age: 69, includeParents: false },
        'oro',
        { funeralAssistance: false, teleVet: false }
      );

      const withTeleVet = engine.calculatePremium(
        { age: 69, includeParents: false },
        'oro',
        { funeralAssistance: false, teleVet: true }
      );

      // Should include TeleVet with optional factor
      expect(withTeleVet.optionalsPremium).toBeCloseTo(66.04, 1); // 52.83 * 1.25
      expect(withTeleVet.totalAnnual).toBeGreaterThan(withoutTeleVet.totalAnnual);
    });

    test('should combine multiple optional services', () => {
      const result = engine.calculatePremium(
        { age: 69, includeParents: false },
        'oro',
        { funeralAssistance: true, teleVet: true }
      );

      const expectedOptionals = (135 + 52.83) * 1.25; // Both services with optional factor
      expect(result.optionalsPremium).toBeCloseTo(expectedOptionals, 1);
    });
  });

  describe('Plan-Specific Services', () => {
    test('Plan Plata should not include premium services', () => {
      const result = engine.calculatePremium(
        { age: 45, includeParents: false },
        'plata',
        { funeralAssistance: false, teleVet: false }
      );

      const coverage = engine.getCoverageDetails('plata', { funeralAssistance: false, teleVet: false });
      const premiumServices = coverage.filter(c => 
        c.serviceName.includes('Urgencia') || 
        c.serviceName.includes('Consulta') || 
        c.serviceName.includes('Pruebas')
      );

      premiumServices.forEach(service => {
        expect(service.included).toBe(false);
      });
    });

    test('Plan Oro should include all premium services', () => {
      const coverage = engine.getCoverageDetails('oro', { funeralAssistance: false, teleVet: false });
      
      const urgencyService = coverage.find(c => c.serviceName.includes('Urgencia'));
      const consultationService = coverage.find(c => c.serviceName.includes('Consulta'));
      const diagnosticService = coverage.find(c => c.serviceName.includes('Pruebas'));

      expect(urgencyService?.included).toBe(true);
      expect(consultationService?.included).toBe(true);
      expect(diagnosticService?.included).toBe(true);
    });
  });

  describe('Calculation Factors', () => {
    test('should apply correct percentage factors', () => {
      const result = engine.calculatePremium(
        { age: 45, includeParents: false },
        'oro',
        { funeralAssistance: false, teleVet: false }
      );

      const basePremium = result.basePremium;
      
      expect(result.expenses).toBeCloseTo(basePremium * 0.2, 2);
      expect(result.profit).toBeCloseTo(basePremium * 0.15, 2);
      expect(result.commission).toBeCloseTo(basePremium * 0.3, 2);
    });

    test('should sum to total premium correctly', () => {
      const result = engine.calculatePremium(
        { age: 45, includeParents: false },
        'oro',
        { funeralAssistance: true, teleVet: false }
      );

      const calculatedTotal = 
        result.basePremium + 
        result.optionalsPremium + 
        result.ageAdjustment + 
        result.familyAdjustment + 
        result.expenses + 
        result.profit + 
        result.commission;

      expect(result.totalAnnual).toBeCloseTo(calculatedTotal, 2);
    });
  });

  describe('Edge Cases', () => {
    test('should handle minimum age', () => {
      const result = engine.calculatePremium(
        { age: 18, includeParents: false },
        'oro',
        { funeralAssistance: false, teleVet: false }
      );

      expect(result.totalAnnual).toBeGreaterThan(0);
      expect(result.ageAdjustment).toBe(0);
    });

    test('should handle maximum age', () => {
      const result = engine.calculatePremium(
        { age: 80, includeParents: false },
        'oro',
        { funeralAssistance: false, teleVet: false }
      );

      expect(result.totalAnnual).toBeGreaterThan(0);
      expect(result.ageAdjustment).toBeGreaterThan(0);
    });

    test('should handle all factors combined', () => {
      const result = engine.calculatePremium(
        { age: 75, includeParents: true },
        'diamante',
        { funeralAssistance: true, teleVet: true }
      );

      expect(result.totalAnnual).toBeGreaterThan(0);
      expect(result.ageAdjustment).toBeGreaterThan(0);
      expect(result.familyAdjustment).toBeGreaterThan(0);
      expect(result.optionalsPremium).toBeGreaterThan(0);
    });
  });

  describe('Coverage Details', () => {
    test('should return correct coverage for each plan', () => {
      const plataCoverage = engine.getCoverageDetails('plata', { funeralAssistance: false, teleVet: false });
      const oroCoverage = engine.getCoverageDetails('oro', { funeralAssistance: false, teleVet: false });
      const diamanteCoverage = engine.getCoverageDetails('diamante', { funeralAssistance: false, teleVet: false });

      expect(plataCoverage.length).toBeGreaterThan(0);
      expect(oroCoverage.length).toBeGreaterThan(plataCoverage.length);
      expect(diamanteCoverage.length).toBeGreaterThanOrEqual(oroCoverage.length);
    });

    test('should include optional services when selected', () => {
      const coverage = engine.getCoverageDetails('oro', { funeralAssistance: true, teleVet: true });
      
      const hasFuneral = coverage.some(c => c.serviceName.includes('funeraria'));
      const hasTeleVet = coverage.some(c => c.serviceName.includes('TeleVet'));

      expect(hasFuneral).toBe(true);
      expect(hasTeleVet).toBe(true);
    });
  });

  describe('Configuration Access', () => {
    test('should provide services configuration', () => {
      const services = engine.getServicesConfiguration();
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
      expect(services[0]).toHaveProperty('name');
      expect(services[0]).toHaveProperty('frequency');
      expect(services[0]).toHaveProperty('baseCost');
    });

    test('should provide calculation factors', () => {
      const factors = engine.getCalculationFactors();
      expect(factors).toHaveProperty('expenses');
      expect(factors).toHaveProperty('profit');
      expect(factors).toHaveProperty('commission');
      expect(factors).toHaveProperty('familyFactor');
      expect(factors).toHaveProperty('optionalFactor');
    });

    test('should provide plans information', () => {
      const plans = engine.getPlansInfo();
      expect(plans).toHaveProperty('plata');
      expect(plans).toHaveProperty('oro');
      expect(plans).toHaveProperty('diamante');
      expect(plans.oro).toHaveProperty('name');
      expect(plans.oro).toHaveProperty('description');
    });
  });
});
