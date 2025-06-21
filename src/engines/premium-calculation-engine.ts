
# ARCHIVO 7: src/engines/premium-calculation-engine.ts
export interface ApplicantData {
  age: number;
  includeParents: boolean;
  parentsAges?: number[];
}

export interface OptionalServices {
  funeralAssistance: boolean;
  teleVet: boolean;
}

export interface PremiumBreakdown {
  basePremium: number;
  optionalsPremium: number;
  ageAdjustment: number;
  familyAdjustment: number;
  expenses: number;
  profit: number;
  commission: number;
  totalAnnual: number;
  totalMonthly: number;
  serviceBreakdown?: ServicePremiumDetail[];
  calculationSteps?: CalculationStep[];
}

export interface ServicePremiumDetail {
  serviceName: string;
  frequency: number;
  baseCost: number;
  riskPremium: number;
  tariffPremium: number;
  planMultiplier: number;
  finalPremium: number;
  included: boolean;
}

export interface CalculationStep {
  step: string;
  description: string;
  value: number;
  calculation: string;
}

export type PlanType = 'plata' | 'oro' | 'diamante';

// Datos exactos extraídos del Excel MIA Health IMASS.xlsx
const EXCEL_SERVICES_DATA = [
  {
    name: 'Telemedicina',
    frequency: 0.02,
    baseCost: 587,
    planFactors: { plata: 1, oro: 1, diamante: 1 },
    serviceType: 'base',
    coverage: { plata: 'Ilimitado', oro: 'Ilimitado', diamante: 'Ilimitado' }
  },
  {
    name: 'Orientación Medica Telefónica',
    frequency: 0.01,
    baseCost: 90.46707516000002,
    planFactors: { plata: 1, oro: 1, diamante: 1 },
    serviceType: 'base',
    coverage: { plata: 'Ilimitado', oro: 'Ilimitado', diamante: 'Ilimitado' }
  },
  {
    name: 'Orientación Psicológica Telefónica',
    frequency: 0.008,
    baseCost: 395.37083653846156,
    planFactors: { plata: 1, oro: 1, diamante: 1 },
    serviceType: 'base',
    coverage: { plata: 'Ilimitado', oro: 'Ilimitado', diamante: 'Ilimitado' }
  },
  {
    name: 'Orientación Nutricional Telefónica',
    frequency: 0.004363331235577932,
    baseCost: 395.37083653846156,
    planFactors: { plata: 1, oro: 1, diamante: 1 },
    serviceType: 'base',
    coverage: { plata: 'Ilimitado', oro: 'Ilimitado', diamante: 'Ilimitado' }
  },
  {
    name: 'Orientación Gestacional Telefónica',
    frequency: 0.002,
    baseCost: 450,
    planFactors: { plata: 1, oro: 1, diamante: 1 },
    serviceType: 'base',
    coverage: { plata: 'Ilimitado', oro: 'Ilimitado', diamante: 'Ilimitado' }
  },
  {
    name: 'Envío De Medico A Domicilio',
    frequency: 0.008,
    baseCost: 758.4522252204242,
    planFactors: { plata: 1, oro: 1.2, diamante: 1.5 },
    serviceType: 'base',
    coverage: { plata: '1 Evento / $1,500', oro: '2 Eventos / $1,500', diamante: '3 Eventos / $1,500' }
  },
  {
    name: 'Asistencia de Urgencia Hospitalaria',
    frequency: 0.01,
    baseCost: 2000,
    planFactors: { plata: 0, oro: 1, diamante: 1.5 },
    serviceType: 'base',
    coverage: { plata: 'N/A', oro: '$2,000', diamante: '$4,000' }
  },
  {
    name: 'Pruebas Diagnosticas',
    frequency: 0.1,
    baseCost: 1735.1026939575004,
    planFactors: { plata: 0, oro: 1, diamante: 1.25 },
    serviceType: 'base',
    coverage: { plata: 'N/A', oro: '7 Exámenes', diamante: '10 Exámenes' }
  },
  {
    name: 'Consulta Médica (Medicina General)',
    frequency: 0.035,
    baseCost: 1441.3658739205093,
    planFactors: { plata: 0, oro: 1, diamante: 1.25 },
    serviceType: 'base',
    coverage: { plata: 'N/A', oro: '2 Eventos / $1,500', diamante: '3 Eventos / $2,000' }
  },
  {
    name: 'Asistencia funeraria',
    frequency: 0.001,
    baseCost: 30000,
    planFactors: { plata: 0, oro: 1, diamante: 1.5 },
    serviceType: 'optional',
    coverage: { plata: 'N/A', oro: '$30,000', diamante: '$50,000' }
  },
  {
    name: 'TeleVet',
    frequency: 0.02,
    baseCost: 587,
    planFactors: { plata: 0, oro: 1, diamante: 1 },
    serviceType: 'optional',
    coverage: { plata: 'N/A', oro: 'Ilimitado', diamante: 'Ilimitado' }
  }
];

const CALCULATION_FACTORS = {
  tariffMultiplier: 4.5,
  expenses: 0.2,
  profit: 0.15,
  commission: 0.3,
  familyFactor: 1.8,
  optionalFactor: 1.25,
  ageFactors: {
    under70: 1.0,
    over70: 2.0
  }
};

export class MIAHealthCalculationEngine {
  private services = EXCEL_SERVICES_DATA;
  private factors = CALCULATION_FACTORS;

  private calculateServicePremium(
    service: any, 
    plan: PlanType, 
    includeCalculationSteps = false
  ): { premium: number; detail?: ServicePremiumDetail } {
    
    const riskPremium = service.frequency * service.baseCost;
    const tariffPremium = riskPremium * this.factors.tariffMultiplier;
    const planMultiplier = service.planFactors[plan];
    const finalPremium = tariffPremium * planMultiplier;
    const included = planMultiplier > 0;

    const detail: ServicePremiumDetail = {
      serviceName: service.name,
      frequency: service.frequency,
      baseCost: service.baseCost,
      riskPremium,
      tariffPremium,
      planMultiplier,
      finalPremium,
      included
    };

    return { premium: finalPremium, detail };
  }

  private calculateBasePremium(
    plan: PlanType, 
    includeDetails = false
  ): { premium: number; details?: ServicePremiumDetail[] } {
    
    let totalPremium = 0;
    const details: ServicePremiumDetail[] = [];

    const includedServices = this.services.filter(service => 
      service.serviceType === 'base' && service.planFactors[plan] > 0
    );

    includedServices.forEach(service => {
      const { premium, detail } = this.calculateServicePremium(service, plan, includeDetails);
      totalPremium += premium;
      
      if (includeDetails && detail) {
        details.push(detail);
      }
    });

    return { premium: totalPremium, details: includeDetails ? details : undefined };
  }

  private calculateOptionalsPremium(
    plan: PlanType,
    optionalServices: OptionalServices,
    includeDetails = false
  ): { premium: number; details?: ServicePremiumDetail[] } {
    
    let totalPremium = 0;
    const details: ServicePremiumDetail[] = [];

    if (optionalServices.funeralAssistance) {
      const service = this.services.find(s => s.name === 'Asistencia funeraria')!;
      const { premium, detail } = this.calculateServicePremium(service, plan, includeDetails);
      totalPremium += premium;
      
      if (includeDetails && detail) {
        details.push(detail);
      }
    }

    if (optionalServices.teleVet) {
      const service = this.services.find(s => s.name === 'TeleVet')!;
      const { premium, detail } = this.calculateServicePremium(service, plan, includeDetails);
      totalPremium += premium;
      
      if (includeDetails && detail) {
        details.push(detail);
      }
    }

    const finalPremium = totalPremium * this.factors.optionalFactor;

    return { 
      premium: finalPremium, 
      details: includeDetails ? details : undefined 
    };
  }

  public calculatePremium(
    applicant: ApplicantData,
    plan: PlanType,
    optionalServices: OptionalServices,
    includeDetailedBreakdown = false
  ): PremiumBreakdown {
    
    const calculationSteps: CalculationStep[] = [];
    const serviceBreakdown: ServicePremiumDetail[] = [];

    // 1. Prima base
    const baseResult = this.calculateBasePremium(plan, includeDetailedBreakdown);
    let basePremium = baseResult.premium;
    
    if (includeDetailedBreakdown && baseResult.details) {
      serviceBreakdown.push(...baseResult.details);
    }

    calculationSteps.push({
      step: '1',
      description: 'Prima base de servicios incluidos',
      value: basePremium,
      calculation: `Suma de servicios del plan ${plan}`
    });

    // 2. Servicios opcionales
    const optionalResult = this.calculateOptionalsPremium(plan, optionalServices, includeDetailedBreakdown);
    let optionalsPremium = optionalResult.premium;
    
    if (includeDetailedBreakdown && optionalResult.details) {
      serviceBreakdown.push(...optionalResult.details);
    }

    calculationSteps.push({
      step: '2',
      description: 'Prima servicios opcionales',
      value: optionalsPremium,
      calculation: `Servicios opcionales × ${this.factors.optionalFactor}`
    });

    // 3. Total antes de factores
    let totalBeforeFactors = basePremium + optionalsPremium;
    
    // 4. Factor de edad
    const ageFactor = applicant.age >= 70 ? this.factors.ageFactors.over70 : this.factors.ageFactors.under70;
    const afterAgeFactor = totalBeforeFactors * ageFactor;
    const ageAdjustment = afterAgeFactor - totalBeforeFactors;
    
    // 5. Factor familiar
    const familyFactor = applicant.includeParents ? this.factors.familyFactor : 1;
    const afterFamilyFactor = afterAgeFactor * familyFactor;
    const familyAdjustment = afterFamilyFactor - afterAgeFactor;
    
    // 6. Gastos adicionales
    const expenses = afterFamilyFactor * this.factors.expenses;
    const profit = afterFamilyFactor * this.factors.profit;
    const commission = afterFamilyFactor * this.factors.commission;

    // 7. Prima total final
    const totalAnnual = afterFamilyFactor + expenses + profit + commission;
    const totalMonthly = totalAnnual / 12;

    const result: PremiumBreakdown = {
      basePremium,
      optionalsPremium,
      ageAdjustment,
      familyAdjustment,
      expenses,
      profit,
      commission,
      totalAnnual: Math.round(totalAnnual * 100) / 100,
      totalMonthly: Math.round(totalMonthly * 100) / 100
    };

    if (includeDetailedBreakdown) {
      result.serviceBreakdown = serviceBreakdown;
      result.calculationSteps = calculationSteps;
    }

    return result;
  }

  public getCoverageDetails(plan: PlanType, optionalServices: OptionalServices): any[] {
    const coverage = [];

    // Servicios base
    this.services
      .filter(service => service.serviceType === 'base')
      .forEach(service => {
        const isIncluded = service.planFactors[plan] > 0;
        coverage.push({
          serviceName: service.name,
          included: isIncluded,
          coverage: service.coverage[plan],
          serviceType: 'base'
        });
      });

    // Servicios opcionales
    if (optionalServices.funeralAssistance) {
      const service = this.services.find(s => s.name === 'Asistencia funeraria')!;
      coverage.push({
        serviceName: service.name,
        included: true,
        coverage: service.coverage[plan],
        serviceType: 'optional'
      });
    }

    if (optionalServices.teleVet) {
      const service = this.services.find(s => s.name === 'TeleVet')!;
      coverage.push({
        serviceName: service.name,
        included: true,
        coverage: service.coverage[plan],
        serviceType: 'optional'
      });
    }

    return coverage;
  }

  public validateAge(age: number): { valid: boolean; message?: string } {
    if (age < 18) {
      return { valid: false, message: 'La edad mínima es 18 años' };
    }
    if (age > 80) {
      return { valid: false, message: 'La edad máxima es 80 años' };
    }
    return { valid: true };
  }

  public getServicesConfiguration() {
    return this.services;
  }

  public getCalculationFactors() {
    return this.factors;
  }

  public getPlansInfo() {
    const plans = {
      plata: {
        name: 'Plan Plata',
        description: 'Plan básico con servicios esenciales de telemedicina',
        monthlyEstimate: '~$600-800',
        features: ['Telemedicina ilimitada', 'Orientaciones telefónicas', 'Médico a domicilio básico']
      },
      oro: {
        name: 'Plan Oro',
        description: 'Plan intermedio con servicios adicionales de salud',
        monthlyEstimate: '~$900-1,200',
        features: ['Todo Plan Plata', 'Urgencias hospitalarias', 'Consultas médicas', 'Pruebas diagnósticas']
      },
      diamante: {
        name: 'Plan Diamante',
        description: 'Plan premium con cobertura completa',
        monthlyEstimate: '~$1,300-1,600',
        features: ['Todo Plan Oro', 'Coberturas aumentadas', 'Máximos beneficios']
      }
    };

    return plans;
  }
}

export default MIAHealthCalculationEngine;
