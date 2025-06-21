# ARCHIVO 6: index.ts (Punto de entrada principal)
import { runLiveValidation } from './src/scripts/run-validation.js';

console.log('🏥 MIA Health Insurance Calculator');
console.log('='.repeat(50));
console.log('');

async function main() {
  try {
    console.log('🚀 Ejecutando validación automática...');
    console.log('');
    
    const success = await runLiveValidation();
    
    if (success) {
      console.log('');
      console.log('✅ Sistema listo para usar!');
      console.log('');
      console.log('📋 Comandos disponibles:');
      console.log('  npm run calculator  # Calculadora interactiva');
      console.log('  npm run table       # Tabla de precios');
      console.log('  npm run api         # Iniciar API server');
      console.log('');
    } else {
      console.log('❌ Validación falló. Revisar configuración.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

main();
