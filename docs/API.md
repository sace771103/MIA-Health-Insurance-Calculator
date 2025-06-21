
# ARCHIVO 23: docs/API.md
# MIA Health Calculator API Documentation

## Overview

RESTful API for calculating health insurance premiums using the MIA Health calculation engine.

## Base URL

```
https://your-domain.com/api
```

## Authentication

Currently, no authentication is required for calculation endpoints.

## Endpoints

### Quotation Endpoints

#### Calculate Premium

Calculate insurance premium based on applicant data and selected plan.

**Endpoint:** `POST /quotation/calculate`

**Request Body:**
```json
{
  "applicant": {
    "age": 35,
    "includeParents": false
  },
  "plan": "oro",
  "optionalServices": {
    "funeralAssistance": false,
    "teleVet": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quotationId": "MIA-1234567890-ABC123",
    "input": { ... },
    "pricing": {
      "annual": 1213.52,
      "monthly": 101.13,
      "breakdown": {
        "basePremium": 110.25,
        "optionalsPremium": 0,
        "ageAdjustment": 0,
        "familyAdjustment": 0,
        "expenses": 22.05,
        "profit": 16.54,
        "commission": 33.08
      }
    },
    "coverage": [...],
    "validUntil": "2024-02-01T00:00:00Z",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "code": "invalid_type",
      "expected": "number",
      "received": "string",
      "path": ["applicant", "age"]
    }
  ]
}
```

#### Get Available Plans

Get information about available insurance plans.

**Endpoint:** `GET /quotation/plans`

**Response:**
```json
{
  "success": true,
  "data": {
    "plata": {
      "name": "Plan Plata",
      "description": "Plan básico con servicios esenciales",
      "monthlyEstimate": "~$600-800",
      "features": ["Telemedicina ilimitada", "..."]
    },
    "oro": { ... },
    "diamante": { ... }
  }
}
```

#### Get Coverage Details

Get detailed coverage information for a specific plan.

**Endpoint:** `GET /quotation/coverage/:plan`

**Parameters:**
- `plan`: Plan type (plata, oro, diamante)

**Response:**
```json
{
  "success": true,
  "data": {
    "plan": "oro",
    "coverage": [
      {
        "serviceName": "Telemedicina",
        "included": true,
        "coverage": "Ilimitado",
        "serviceType": "base"
      }
    ]
  }
}
```

#### Validate Applicant Data

Validate applicant age and other criteria.

**Endpoint:** `POST /quotation/validate`

**Request Body:**
```json
{
  "age": 35
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

### Calculator Endpoints

#### Get Price Table

Get comprehensive price table for all ages and plans.

**Endpoint:** `GET /calculator/price-table`

**Response:**
```json
{
  "success": true,
  "data": {
    "ages": [18, 25, 30, ...],
    "plans": ["plata", "oro", "diamante"],
    "priceTable": [
      {
        "age": 25,
        "plata": {"annual": 800, "monthly": 67},
        "oro": {"annual": 1200, "monthly": 100},
        "diamante": {"annual": 1500, "monthly": 125}
      }
    ],
    "notes": ["Precios en pesos mexicanos", "..."]
  }
}
```

#### Compare Plans by Age

Get plan comparison for a specific age.

**Endpoint:** `GET /calculator/compare/:age`

**Parameters:**
- `age`: Applicant age (18-80)

**Response:**
```json
{
  "success": true,
  "data": {
    "age": 35,
    "comparison": [
      {
        "plan": "oro",
        "pricing": {"annual": 1200, "monthly": 100},
        "coverage": [...],
        "features": {...}
      }
    ],
    "recommendation": "Plan Oro - Equilibrio perfecto..."
  }
}
```

#### Get Calculation Factors

Get the calculation factors used by the engine.

**Endpoint:** `GET /calculator/factors`

**Response:**
```json
{
  "success": true,
  "data": {
    "factors": {
      "expenses": 0.2,
      "profit": 0.15,
      "commission": 0.3,
      "familyFactor": 1.8,
      "optionalFactor": 1.25,
      "ageFactors": {"under70": 1.0, "over70": 2.0}
    },
    "description": {...}
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per IP

## Data Types

### Plan Types
- `plata`: Basic plan
- `oro`: Intermediate plan  
- `diamante`: Premium plan

### Age Ranges
- Minimum: 18 years
- Maximum: 80 years
- Factor change: 70 years (2x multiplier)

### Currency
All monetary values are in Mexican Pesos (MXN).
