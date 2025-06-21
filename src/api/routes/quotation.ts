
# ARCHIVO 13: src/api/routes/quotation.ts
import express from 'express';
import { z } from 'zod';
import MIAHealthCalculationEngine from '../../engines/premium-calculation-engine.js';

const router = express.Router();
const engine = new MIAHealthCalculationEngine();

// Schemas de validación
const QuotationRequestSchema = z.object({
  applicant: z.object({
    age: z.number().min(18).max(80),
    includeParents: z.boolean().default(false)
  }),
  plan: z.enum(['plata', 'oro', 'diamante']),
  optionalServices: z.object({
    funeralAssistance: z.boolean().default(false),
    teleVet: z.boolean().default(false)
  }).default({})
});

// POST /api/quotation/calculate
router.post('/calculate', (req, res) => {
  try {
    const validatedData = QuotationRequestSchema.parse(req.body);
    
    // Validar edad
    const ageValidation = engine.validateAge(validatedData.applicant.age);
    if (!ageValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid age',
        message: ageValidation.message
      });
    }

    // Calcular prima
    const premiumBreakdown = engine.calculatePremium(
      validatedData.applicant,
      validatedData.plan,
      validatedData.optionalServices,
      true // Incluir desglose detallado
    );

    // Obtener detalles de cobertura
    const coverageDetails = engine.getCoverageDetails(
      validatedData.plan,
      validatedData.optionalServices
    );

    const quotation = {
      quotationId: `MIA-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      input: validatedData,
      pricing: {
        annual: premiumBreakdown.totalAnnual,
        monthly: premiumBreakdown.totalMonthly,
        breakdown: {
          basePremium: premiumBreakdown.basePremium,
          optionalsPremium: premiumBreakdown.optionalsPremium,
          ageAdjustment: premiumBreakdown.ageAdjustment,
          familyAdjustment: premiumBreakdown.familyAdjustment,
          expenses: premiumBreakdown.expenses,
          profit: premiumBreakdown.profit,
          commission: premiumBreakdown.commission
        },
        serviceBreakdown: premiumBreakdown.serviceBreakdown
      },
      coverage: coverageDetails,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      createdAt: new Date()
    };

    res.status(200).json({
      success: true,
      data: quotation
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.errors
      });
    }
    
    console.error('Quotation calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Error calculating quotation'
    });
  }
});

// GET /api/quotation/plans
router.get('/plans', (req, res) => {
  try {
    const plansInfo = engine.getPlansInfo();
    
    res.json({
      success: true,
      data: plansInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error retrieving plans information'
    });
  }
});

// GET /api/quotation/coverage/:plan
router.get('/coverage/:plan', (req, res) => {
  try {
    const plan = req.params.plan as 'plata' | 'oro' | 'diamante';
    
    if (!['plata', 'oro', 'diamante'].includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan',
        message: 'Plan must be plata, oro, or diamante'
      });
    }

    const coverage = engine.getCoverageDetails(plan, { funeralAssistance: false, teleVet: false });
    
    res.json({
      success: true,
      data: {
        plan,
        coverage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error retrieving coverage details'
    });
  }
});

// POST /api/quotation/validate
router.post('/validate', (req, res) => {
  try {
    const { age } = req.body;
    
    if (!age || typeof age !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Age is required and must be a number'
      });
    }

    const validation = engine.validateAge(age);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error validating age'
    });
  }
});

export default router;
