
# ARCHIVO 10: src/scripts/custom-calculator.ts
import MIAHealthCalculationEngine, { PlanType } from '../engines/premium-calculation-engine.js';

class InteractiveCalculator {
  private engine: MIAHealthCalculationEngine;

  constructor() {
    this.engine = new MIAHealthCalculationEngine();
  }

  public showBanner(): void {
    console.log('\n🧮 CALCULADORA INTERACTIVA MIA HEALTH');
    console.log('='.repeat(50));
  }

  public calculateQuote(
    age: number,
    plan: PlanType,
    includeParents: boolean = false,
    funeralAssistance: boolean = false,
    teleVet: boolean = false
  ): void {
    console.log(`\n🔍 COTIZACIÓN PERSONALIZADA`);
    console.log(`   👤 Edad: ${age} años`);
    console.log(`   📋 Plan: ${plan.toUpperCase()}`);
    console.log(`   👨‍👩‍👧‍👦 Incluir padres: ${includeParents ? 'Sí' : 'No'}`);
    console.log(`   ⚰️  Asistencia funeraria: ${funeralAssistance ? 'Sí' : 'No'}`);
    console.log(`   🐕 TeleVet: ${teleVet ? 'Sí' : 'No'}`);

    const result = this.engine.calculatePremium(
      { age, includeParents },
      plan,
      { funeralAssistance, teleVet },
      true
    );

    console.log(`\n💰 RESULTADO:`);
    console.log(`   📅 Prima anual: ${result.totalAnnual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
    console.log(`   📆 Prima mensual: ${result.totalMonthly.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);

    console.log(`\n🧮 DESGLOSE DETALLADO:`);
    console.log(`   Prima base: ${result.basePremium.toFixed(2)}`);
    console.log(`   Servicios opcionales: ${result.optionalsPremium.toFixed(2)}`);
    console.log(`   Ajuste por edad: ${result.ageAdjustment.toFixed(2)}`);
    console.log(`   Ajuste familiar: ${result.familyAdjustment.toFixed(2)}`);
    console.log(`   Gastos (20%): ${result.expenses.toFixed(2)}`);
    console.log(`   Utilidad (15%): ${result.profit.toFixed(2)}`);
    console.log(`   Comisión (30%): ${result.commission.toFixed(2)}`);

    const coverage = this.engine.getCoverageDetails(plan, { funeralAssistance, teleVet });
    console.log(`\n📋 COBERTURAS INCLUIDAS:`);
    coverage.forEach(item => {
      if (item.included) {
        const type = item.serviceType === 'base' ? '🏥' : '⭐';
        console.log(`   ${type} ${item.serviceName}: ${item.coverage}`);
      }
    });
  }

  public showPlanComparison(age: number): void {
    console.log(`\n📊 COMPARACIÓN DE PLANES (${age} años)`);
    console.log('='.repeat(70));

    const plans: PlanType[] = ['plata', 'oro', 'diamante'];
    const results = plans.map(plan => ({
      plan,
      result: this.engine.calculatePremium(
        { age, includeParents: false },
        plan,
        { funeralAssistance: false, teleVet: false }
      )
    }));

    console.log('Plan'.padEnd(12) + 'Anual'.padStart(12) + 'Mensual'.padStart(12) + 'Diferencia'.padStart(15));
    console.log('-'.repeat(51));

    results.forEach((item, index) => {
      const planName = item.plan.toUpperCase();
      const annual = `${item.result.totalAnnual.toFixed(0)}`;
      const monthly = `${item.result.totalMonthly.toFixed(0)}`;
      const diff = index > 0 ? `+${(item.result.totalAnnual - results[0].result.totalAnnual).toFixed(0)}` : 'Base';
      
      console.log(planName.padEnd(12) + annual.padStart(12) + monthly.padStart(12) + diff.padStart(15));
    });

    console.log('\n💡 Recomendación:');
    if (age < 35) {
      console.log('   Plan Oro - Equilibrio perfecto entre precio y cobertura');
    } else if (age < 65) {
      console.log('   Plan Oro o Diamante - Mayor cobertura para edad intermedia');
    } else {
      console.log('   Plan Diamante - Máxima cobertura para edad avanzada');
    }
  }

  public showAgeImpactAnalysis(plan: PlanType): void {
    console.log(`\n📈 ANÁLISIS DE IMPACTO POR EDAD - PLAN ${plan.toUpperCase()}`);
    console.log('='.repeat(60));

    const ages = [25, 35, 45, 55, 65, 69, 70, 75, 80];
    
    console.log('Edad'.padEnd(8) + 'Prima Anual'.padStart(15) + 'Prima Mensual'.padStart(15) + 'Factor'.padStart(10));
    console.log('-'.repeat(48));

    const baseResult = this.engine.calculatePremium(
      { age: 35, includeParents: false },
      plan,
      { funeralAssistance: false, teleVet: false }
    );

    ages.forEach(age => {
      const result = this.engine.calculatePremium(
        { age, includeParents: false },
        plan,
        { funeralAssistance: false, teleVet: false }
      );

      const factor = (result.totalAnnual / baseResult.totalAnnual).toFixed(2);
      const annual = `${result.totalAnnual.toFixed(0)}`;
      const monthly = `${result.totalMonthly.toFixed(0)}`;
      
      console.log(age.toString().padEnd(8) + annual.padStart(15) + monthly.padStart(15) + `${factor}x`.padStart(10));
    });

    console.log('\n📊 Observaciones:');
    console.log('   • A partir de 70 años se aplica factor 2x');
    console.log('   • El incremento es proporcional al riesgo');
    console.log('   • Mejor momento para contratar: antes de los 70');
  }
}

// Funciones de utilidad para uso directo
export function calculateQuote(age: number, plan: PlanType, options: any = {}): void {
  const calculator = new InteractiveCalculator();
  calculator.showBanner();
  calculator.calculateQuote(
    age,
    plan,
    options.includeParents || false,
    options.funeralAssistance || false,
    options.teleVet || false
  );
}

export function comparePlans(age: number): void {
  const calculator = new InteractiveCalculator();
  calculator.showBanner();
  calculator.showPlanComparison(age);
}

export function analyzeAgeImpact(plan: PlanType): void {
  const calculator = new InteractiveCalculator();
  calculator.showBanner();
  calculator.showAgeImpactAnalysis(plan);
}

// Script principal si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const calculator = new InteractiveCalculator();
  calculator.showBanner();
  
  // Ejemplo por defecto
  console.log('\n🎯 EJEMPLO DEMOSTRATIVO:');
  calculator.calculateQuote(45, 'oro', false, false, false);
  calculator.showPlanComparison(45);
}

export { InteractiveCalculator };
