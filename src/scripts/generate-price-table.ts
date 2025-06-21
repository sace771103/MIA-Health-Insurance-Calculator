
# ARCHIVO 11: src/scripts/generate-price-table.ts
import MIAHealthCalculationEngine, { PlanType } from '../engines/premium-calculation-engine.js';

class PriceTableGenerator {
  private engine: MIAHealthCalculationEngine;

  constructor() {
    this.engine = new MIAHealthCalculationEngine();
  }

  public generateMainTable(): void {
    console.log('\n📊 TABLA OFICIAL DE PRECIOS MIA HEALTH');
    console.log('='.repeat(80));
    console.log('💰 Primas anuales por edad y plan (sin servicios opcionales)');
    console.log('='.repeat(80));

    const ages = [18, 25, 30, 35, 40, 45, 50, 55, 60, 65, 69, 70, 75, 80];
    const plans: PlanType[] = ['plata', 'oro', 'diamante'];

    // Header
    let header = 'Edad'.padEnd(8);
    plans.forEach(plan => {
      header += plan.charAt(0).toUpperCase() + plan.slice(1).padStart(12);
    });
    console.log(header);
    console.log('-'.repeat(8 + 12 * plans.length));

    // Filas de datos
    ages.forEach(age => {
      let row = age.toString().padEnd(8);
      
      plans.forEach(plan => {
        const result = this.engine.calculatePremium(
          { age, includeParents: false },
          plan,
          { funeralAssistance: false, teleVet: false }
        );
        
        const price = `${result.totalAnnual.toFixed(0)}`;
        row += price.padStart(12);
      });
      
      console.log(row);
      
      // Destacar el cambio en 70 años
      if (age === 69) {
        console.log('│' + '─'.repeat(6) + '┼' + '─'.repeat(12 * plans.length - 1) + '│ ← Factor edad 2x');
      }
    });

    console.log('-'.repeat(8 + 12 * plans.length));
    console.log('\n📋 NOTAS:');
    console.log('   • Precios en pesos mexicanos (MXN)');
    console.log('   • A partir de 70 años se aplica factor 2x');
    console.log('   • Sin factor familiar ni servicios opcionales');
    console.log('   • Para cotización personalizada usar: npm run calculator');
  }

  public generateFamilyTable(): void {
    console.log('\n👨‍👩‍👧‍👦 TABLA DE PRECIOS CON FACTOR FAMILIAR');
    console.log('='.repeat(60));
    console.log('💰 Incremento al incluir padres/suegros (Factor 1.8x)');
    console.log('='.repeat(60));

    const ages = [35, 45, 55, 65, 69];
    const plan: PlanType = 'oro';

    console.log('Edad'.padEnd(8) + 'Individual'.padStart(12) + 'Familiar'.padStart(12) + 'Incremento'.padStart(12));
    console.log('-'.repeat(44));

    ages.forEach(age => {
      const individual = this.engine.calculatePremium(
        { age, includeParents: false },
        plan,
        { funeralAssistance: false, teleVet: false }
      );

      const familiar = this.engine.calculatePremium(
        { age, includeParents: true },
        plan,
        { funeralAssistance: false, teleVet: false }
      );

      const increment = familiar.totalAnnual - individual.totalAnnual;

      console.log(
        age.toString().padEnd(8) +
        `${individual.totalAnnual.toFixed(0)}`.padStart(12) +
        `${familiar.totalAnnual.toFixed(0)}`.padStart(12) +
        `+${increment.toFixed(0)}`.padStart(12)
      );
    });

    console.log('\n📋 Plan Oro con/sin cobertura familiar');
  }

  public generateOptionalServicesTable(): void {
    console.log('\n⭐ TABLA DE SERVICIOS OPCIONALES');
    console.log('='.repeat(50));
    console.log('💰 Costo adicional por servicio opcional');
    console.log('='.repeat(50));

    const age = 45;
    const plans: PlanType[] = ['oro', 'diamante'];

    console.log('Servicio'.padEnd(25) + 'Oro'.padStart(12) + 'Diamante'.padStart(13));
    console.log('-'.repeat(50));

    // Asistencia funeraria
    plans.forEach((plan, index) => {
      const result = this.engine.calculatePremium(
        { age, includeParents: false },
        plan,
        { funeralAssistance: true, teleVet: false }
      );

      const base = this.engine.calculatePremium(
        { age, includeParents: false },
        plan,
        { funeralAssistance: false, teleVet: false }
      );

      const additional = result.totalAnnual - base.totalAnnual;

      if (index === 0) {
        let row = 'Asistencia Funeraria'.padEnd(25);
        row += `+${additional.toFixed(0)}`.padStart(12);
        
        // Calcular para diamante
        const diamondResult = this.engine.calculatePremium(
          { age, includeParents: false },
          'diamante',
          { funeralAssistance: true, teleVet: false }
        );
        const diamondBase = this.engine.calculatePremium(
          { age, includeParents: false },
          'diamante',
          { funeralAssistance: false, teleVet: false }
        );
        const diamondAdditional = diamondResult.totalAnnual - diamondBase.totalAnnual;
        
        row += `+${diamondAdditional.toFixed(0)}`.padStart(13);
        console.log(row);
      }
    });

    // TeleVet
    const televetOro = this.engine.calculatePremium(
      { age, includeParents: false },
      'oro',
      { funeralAssistance: false, teleVet: true }
    );
    const baseOro = this.engine.calculatePremium(
      { age, includeParents: false },
      'oro',
      { funeralAssistance: false, teleVet: false }
    );
    const televetAdditional = televetOro.totalAnnual - baseOro.totalAnnual;

    console.log(
      'TeleVet'.padEnd(25) +
      `+${televetAdditional.toFixed(0)}`.padStart(12) +
      `+${televetAdditional.toFixed(0)}`.padStart(13)
    );

    console.log('\n📋 Servicios opcionales disponibles desde Plan Oro');
    console.log('📋 Precios con factor opcional 1.25x incluido');
  }

  public generateMonthlyTable(): void {
    console.log('\n📅 TABLA DE PRIMAS MENSUALES');
    console.log('='.repeat(50));
    console.log('💰 Pago mensual por plan (edades más comunes)');
    console.log('='.repeat(50));

    const ages = [25, 35, 45, 55, 65, 69];
    const plans: PlanType[] = ['plata', 'oro', 'diamante'];

    let header = 'Edad'.padEnd(8);
    plans.forEach(plan => {
      header += plan.charAt(0).toUpperCase() + plan.slice(1).padStart(10);
    });
    console.log(header);
    console.log('-'.repeat(8 + 10 * plans.length));

    ages.forEach(age => {
      let row = age.toString().padEnd(8);
      
      plans.forEach(plan => {
        const result = this.engine.calculatePremium(
          { age, includeParents: false },
          plan,
          { funeralAssistance: false, teleVet: false }
        );
        
        const monthly = `${result.totalMonthly.toFixed(0)}`;
        row += monthly.padStart(10);
      });
      
      console.log(row);
    });

    console.log('\n📋 Primas mensuales sin servicios opcionales');
  }

  public generateCompleteReport(): void {
    console.log('🏥 REPORTE COMPLETO DE PRECIOS MIA HEALTH');
    console.log('='.repeat(80));
    
    this.generateMainTable();
    this.generateMonthlyTable();
    this.generateFamilyTable();
    this.generateOptionalServicesTable();
    
    console.log('\n📞 INFORMACIÓN DE CONTACTO:');
    console.log('   📧 Email: ventas@miahealth.com');
    console.log('   📱 Teléfono: 800-MIA-HEALTH (800-642-4325)');
    console.log('   🌐 Web: https://miahealth.com.mx');
    console.log('\n📋 Para cotización personalizada: npm run calculator');
    console.log('🎯 Para validar cálculos: npm run validate');
  }
}

// Función principal exportada
export function generatePriceTable(type: string = 'complete'): void {
  const generator = new PriceTableGenerator();
  
  switch (type) {
    case 'main':
      generator.generateMainTable();
      break;
    case 'monthly':
      generator.generateMonthlyTable();
      break;
    case 'family':
      generator.generateFamilyTable();
      break;
    case 'optional':
      generator.generateOptionalServicesTable();
      break;
    case 'complete':
    default:
      generator.generateCompleteReport();
      break;
  }
}

// Script principal si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePriceTable('complete');
}

export { PriceTableGenerator };
