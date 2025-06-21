
# ARCHIVO 20: src/tests/validator.test.ts
import { LiveValidator } from '../engines/calculation-validator.js';

describe('Calculation Validator', () => {
  let validator: LiveValidator;

  beforeEach(() => {
    validator = new LiveValidator();
  });

  describe('Excel Validation', () => {
    test('should validate base case against Excel values', async () => {
      const result = await validator.runLiveValidation();
      expect(result).toBe(true);
    });

    test('should have correct tolerance settings', () => {
      expect(validator['tolerance']).toBe(0.01);
    });
  });

  describe('Validation Results', () => {
    test('should track validation results', async () => {
      await validator.runLiveValidation();
      expect(validator['results']).toBeDefined();
      expect(Array.isArray(validator['results'])).toBe(true);
      expect(validator['results'].length).toBeGreaterThan(0);
    });

    test('should identify critical vs normal tests', async () => {
      await validator.runLiveValidation();
      const results = validator['results'];
      
      const criticalTests = results.filter(r => r.critical);
      const normalTests = results.filter(r => !r.critical);

      expect(criticalTests.length).toBeGreaterThan(0);
      expect(normalTests.length).toBeGreaterThan(0);
    });
  });
});
