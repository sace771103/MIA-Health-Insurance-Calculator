
# ARCHIVO 28: README_DEPLOYMENT.md
# MIA Health Calculator - Deployment Guide

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone 
cd mia-health-insurance-calculator
npm install
```

### 2. Run Validation
```bash
npm run validate
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access Application
- **Main Interface:** http://localhost:3000
- **Calculator:** http://localhost:3000/calculator
- **API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health

## 📁 Project Structure

```
mia-health-insurance-calculator/
├── 📄 Configuration Files
│   ├── package.json          # Dependencies and scripts
│   ├── tsconfig.json         # TypeScript configuration
│   ├── jest.config.js        # Testing configuration
│   └── .replit               # Replit configuration
├── 🔧 Source Code
│   ├── src/
│   │   ├── engines/          # Calculation engine and validator
│   │   ├── api/              # REST API server and routes
│   │   ├── scripts/          # Command-line utilities
│   │   └── tests/            # Unit and integration tests
├── 🌐 Web Interface
│   ├── web/
│   │   ├── index.html        # Main landing page
│   │   ├── calculator.html   # Interactive calculator
│   │   └── assets/           # CSS and JavaScript
├── 📚 Documentation
│   └── docs/                 # API docs and guides
└── 🛠️ Utilities
    └── scripts/              # Deployment and backup scripts
```

## ⚡ Available Commands

### Development
```bash
npm run dev          # Start development server with auto-reload
npm run validate     # Run calculation validation against Excel
npm run calculator   # Launch interactive calculator
npm run table        # Generate price tables
```

### Testing
```bash
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Production
```bash
npm run build       # Build for production
npm start          # Start production server
npm run api        # Start API server only
```

### Utilities
```bash
npm run validate:verbose    # Detailed validation output
npm run validate:full      # Complete validation with reports
```

## 🔧 Environment Variables

Create `.env` file based on `.env.example`:

```bash
# Required
NODE_ENV=development
PORT=3000

# Optional
CALCULATION_TOLERANCE=0.01
CACHE_TTL=3600
LOG_LEVEL=info
```

## 🎯 Validation System

The system includes comprehensive validation against the original Excel file:

### Critical Validations ✅
- **Base Case:** Age 69, Plan Oro → $1,213.52 annual
- **Plan Diamante:** Premium calculation accuracy  
- **Age Factor:** 2x multiplier for age ≥70
- **Optional Services:** Funeral assistance and TeleVet
- **Mathematical Consistency:** All calculations sum correctly

### Tolerance Settings
- **Default:** ±$0.01 precision
- **Critical tests:** Must pass exactly
- **Non-critical:** Minor rounding differences allowed

## 🌐 API Endpoints

### Quotation API
- `POST /api/quotation/calculate` - Calculate premium
- `GET /api/quotation/plans` - Get available plans  
- `GET /api/quotation/coverage/:plan` - Get coverage details

### Calculator API  
- `GET /api/calculator/price-table` - Get price matrix
- `GET /api/calculator/compare/:age` - Compare plans by age
- `GET /api/calculator/factors` - Get calculation factors

### System
- `GET /health` - Health check
- `GET /api` - API information

## 🏗️ Deployment Options

### Replit (Recommended for Demo)
1. Import from GitHub
2. Replit auto-configures using `.replit` file
3. Click "Run" button
4. Access via provided URL

### Local Development
```bash
git clone 
npm install
npm run dev
```

### Docker
```bash
docker build -t mia-health-calculator .
docker run -p 3000:3000 mia-health-calculator
```

### Cloud Platforms
- **Vercel:** Auto-deploy from GitHub
- **Netlify:** Static site + serverless functions
- **Heroku:** Traditional app deployment
- **AWS:** Full production infrastructure

## 🧪 Testing Strategy

### Unit Tests (70%)
- Individual function testing
- Business logic validation
- Edge case handling

### Integration Tests (20%)
- API endpoint testing
- Database operations
- Service interactions

### End-to-End Tests (10%)
- Complete user workflows
- Critical business processes
- Cross-browser compatibility

### Excel Validation (Critical)
- Real-time comparison with Excel values
- Automated tolerance checking
- Regression testing

## 📊 Performance Metrics

### Target Performance
- **Calculation Time:** <10ms per premium calculation
- **API Response:** <200ms for quotation endpoints
- **Page Load:** <3 seconds for calculator interface
- **Uptime:** >99.9% availability

### Monitoring
- Health check endpoint for status monitoring
- Performance metrics collection
- Error tracking and alerting
- Usage analytics

## 🔒 Security Considerations

### Input Validation
- Zod schema validation for all inputs
- Age range enforcement (18-80)
- Plan type validation
- SQL injection prevention

### API Security
- Rate limiting per IP
- CORS configuration
- Helmet security headers
- Input sanitization

### Data Protection
- No sensitive data storage
- Calculation data in memory only
- Secure communication (HTTPS)
- Privacy compliance ready

## 🚨 Troubleshooting

### Common Issues

#### Validation Failures
```bash
# Check detailed validation output
npm run validate:verbose

# Verify input parameters match Excel
# Review calculation factors
# Check for rounding differences
```

#### Port Already in Use
```bash
# Change port in .env file
PORT=3001

# Or find and kill process
lsof -ti:3000 | xargs kill
```

#### Build Errors
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

#### Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose

# Check specific test file
npm test -- engine.test.ts
```

### Debug Mode
```bash
NODE_ENV=development npm run validate -- --verbose
```

### Log Analysis
- Check console output for detailed calculation steps
- Review error messages for specific issues
- Validate input data format and ranges

## 📈 Scaling Considerations

### Horizontal Scaling
- Stateless design enables multiple instances
- Load balancer distribution
- Auto-scaling based on demand

### Performance Optimization
- In-memory calculation (no database calls)
- Caching of static configuration
- Efficient algorithm implementation
- Minimal external dependencies

### Monitoring & Alerting
- Health check monitoring
- Performance metric tracking
- Error rate monitoring
- Automated alert systems

## 🔄 Maintenance

### Regular Tasks
- **Weekly:** Run validation tests
- **Monthly:** Review performance metrics
- **Quarterly:** Update dependencies
- **Annually:** Review calculation factors

### Excel File Management
```bash
# Backup Excel file
node scripts/backup-excel.js create

# List backups
node scripts/backup-excel.js list

# Verify backup integrity
node scripts/backup-excel.js verify 
```

### Updates and Changes
1. Update calculation factors in engine
2. Run validation tests
3. Update documentation
4. Deploy with testing
5. Monitor post-deployment

---

**🏥 MIA Health Insurance Calculator v1.0.0**  
*Complete calculation engine with Excel validation*
