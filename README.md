# 🏥 MIA Health Insurance Calculator

**Motor de cálculo de primas de seguro de salud con validación automática contra Excel**

## 🚀 Características

- ✅ **Motor de cálculo** calibrado exactamente con memoria de cálculo Excel
- ✅ **Validación automática** en tiempo real contra valores esperados
- ✅ **API REST** completa para integración
- ✅ **Interfaz web** para pruebas y demostraciones
- ✅ **3 planes** disponibles: Plata, Oro, Diamante
- ✅ **Servicios opcionales** (Asistencia funeraria, TeleVet)
- ✅ **Factores de edad** y familia automáticos
- ✅ **Cálculos instantáneos** con desglose detallado

## 📊 Planes Disponibles

| Plan | Servicios Base | Urgencias | Consultas | Pruebas |
|------|----------------|-----------|-----------|---------|
| **Plata** | Telemedicina + Orientaciones | ❌ | ❌ | ❌ |
| **Oro** | Todo Plata + | $2,000 | 2 eventos | 7 exámenes |
| **Diamante** | Todo Oro + | $4,000 | 3 eventos | 10 exámenes |

## 🚀 Uso Rápido

### Validar Motor de Cálculo
```bash
npm run validate
```

### Calculadora Interactiva
```bash
npm run calculator
```

### Generar Tabla de Precios
```bash
npm run table
```

### Iniciar API Server
```bash
npm run api
```

## 📋 Ejemplos de Uso

### Cotización Básica
```typescript
import { MIAHealthCalculationEngine } from './src/engines/premium-calculation-engine';

const engine = new MIAHealthCalculationEngine();

const result = engine.calculatePremium(
  { age: 35, includeParents: false },
  'oro',
  { funeralAssistance: false, teleVet: false }
);

console.log(`Prima anual: $${result.totalAnnual}`);
console.log(`Prima mensual: $${result.totalMonthly}`);
```

### API Request
```bash
curl -X POST http://localhost:3000/api/quotation/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "applicant": {"age": 35, "includeParents": false},
    "plan": "oro",
    "optionalServices": {"funeralAssistance": false, "teleVet": false}
  }'
```

## 🔧 Configuración de Desarrollo

1. **Clonar repositorio**
2. **Instalar dependencias:** `npm install`
3. **Ejecutar validación:** `npm run validate`
4. **Iniciar desarrollo:** `npm run dev`

## 📊 Validación Excel

El motor está calibrado contra la memoria de cálculo Excel original:

- ✅ **Caso base** (69 años, Plan Oro): $1,213.52 anual
- ✅ **Plan Diamante**: $1,518.67 anual  
- ✅ **Factor edad >70**: 2x automático
- ✅ **Servicios opcionales**: Con factor 1.25x
- ✅ **Precisión**: ±$0.01 tolerancia

## 🌐 Endpoints API

- `POST /api/quotation/calculate` - Calcular cotización
- `GET /api/plans` - Obtener planes disponibles
- `GET /api/coverage/:plan` - Detalles de cobertura
- `POST /api/validate` - Validar datos de aplicante

## 📈 Factores de Cálculo

- **Gastos:** 20%
- **Utilidad:** 15% 
- **Comisión:** 30%
- **Factor familiar:** 1.8x
- **Factor opcional:** 1.25x
- **Factor edad >70:** 2x

## 🧪 Testing

```bash
# Validación completa
npm run validate

# Tests unitarios
npm test

# Calculadora personalizada
npm run calculator -- --age 45 --plan oro --parents
```

## 📦 Deploy

Compatible con:
- ✅ **Replit** (configuración automática)
- ✅ **Vercel** 
- ✅ **Netlify**
- ✅ **AWS/Heroku**
- ✅ **Docker**

## 🏗️ Arquitectura

```
src/
├── engines/          # Motor de cálculo y validación
├── api/              # REST API endpoints
├── scripts/          # Herramientas de línea de comandos
├── tests/            # Tests automatizados
└── web/              # Interfaz web de demostración
```

## 📞 Soporte

- **Documentación completa:** `/docs`
- **Ejemplos de API:** `/docs/API.md`
- **Comparación Excel:** `/docs/EXCEL-COMPARISON.md`

---
🏥 **MIA Health Insurance** - Motor de cálculo profesional v1.0.0
