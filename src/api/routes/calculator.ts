
# ARCHIVO 14: src/api/routes/calculator.ts
import express from 'express';
import MIAHealthCalculationEngine from '../../engines/premium-calculation-engine.js';

const router = express.Router();
const engine = new MIAHealthCalculationEngine();

// GET /api/calculator/price-table
router.get('/price-table', (req, res) => {
  try {
    const ages = [18, 25, 30, 35, 40, 45, 50, 55, 60, 65, 69, 70, 75, 80];
    const plans = ['plata', 'oro', 'diamante'] as const;
    
    const priceTable = ages.map(age => {
      const ageData: any = { age };
      
      plans.forEach(plan => {
        const result = engine.calculatePremium(
          { age, includeParents: false },
          plan,
          { funeralAssistance: false, teleVet: false }
        );
        
        ageData[plan] = {
          annual: result.totalAnnual,
          monthly: result.totalMonthly
        };
      });
      
      return ageData;
    });

    res.json({
      success: true,
      data: {
        ages,
        plans,
        priceTable,
        notes: [
          'Precios en pesos mexicanos (MXN)',
          'A partir de 70 años se aplica factor 2x',
          'Sin factor familiar ni servicios opcionales'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error generating price table'
    });
  }
});

// GET /api/calculator/compare/:age
router.get('/compare/:age', (req, res) => {
  try {
    const age = parseInt(req.params.age);
    
    if (isNaN(age) || age < 18 || age > 80) {
      return res.status(400).json({
        success: false,
        error: 'Invalid age. Must be between 18 and 80'
      });
    }

    const plans = ['plata', 'oro', 'diamante'] as const;
    const comparison = plans.map(plan => {
      const result = engine.calculatePremium(
        { age, includeParents: false },
        plan,
        { funeralAssistance: false, teleVet: false }
      );

      const coverage = engine.getCoverageDetails(plan, { funeralAssistance: false, teleVet: false });

      return {
        plan,
        pricing: {
          annual: result.totalAnnual,
          monthly: result.totalMonthly
        },
        coverage: coverage.filter(c => c.included),
        features: engine.getPlansInfo()[plan]
      };
    });

    res.json({
      success: true,
      data: {
        age,
        comparison,
        recommendation: getRecommendation(age)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error generating plan comparison'
    });
  }
});

// GET /api/calculator/factors
router.get('/factors', (req, res) => {
  try {
    const factors = engine.getCalculationFactors();
    
    res.json({
      success: true,
      data: {
        factors,
        description: {
          tariffMultiplier: 'Factor para convertir prima de riesgo a prima tarifa',
          expenses: 'Porcentaje de gastos administrativos',
          profit: 'Porcentaje de utilidad',
          commission: 'Porcentaje de comisión',
          familyFactor: 'Factor aplicado al incluir padres/suegros',
          optionalFactor: 'Factor aplicado a servicios opcionales',
          ageFactors: 'Factores por rango de edad'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error retrieving calculation factors'
    });
  }
});

// Helper function
function getRecommendation(age: number): string {
  if (age < 35) {
    return 'Plan Oro - Equilibrio perfecto entre precio y cobertura para edad joven';
  } else if (age < 65) {
    return 'Plan Oro o Diamante - Mayor cobertura recomendada para edad intermedia';
  } else {
    return 'Plan Diamante - Máxima cobertura recomendada para edad avanzada';
  }
}

export default router;
