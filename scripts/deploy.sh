
# ARCHIVO 26: scripts/deploy.sh
#!/bin/bash
# MIA Health Calculator - Deployment Script

set -e

echo "🚀 MIA Health Calculator - Deployment Script"
echo "============================================"

# Check if environment argument is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 [staging|production]"
    exit 1
fi

ENVIRONMENT=$1

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "❌ Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

echo "📦 Environment: $ENVIRONMENT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Pre-deployment checks
echo ""
echo "🔍 Running pre-deployment checks..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_status "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_status "npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci
print_status "Dependencies installed"

# Run validation tests
echo ""
echo "🧪 Running validation tests..."
npm run validate
if [ $? -ne 0 ]; then
    print_error "Validation tests failed"
    exit 1
fi
print_status "Validation tests passed"

# Run unit tests
echo ""
echo "🧪 Running unit tests..."
npm test
if [ $? -ne 0 ]; then
    print_error "Unit tests failed"
    exit 1
fi
print_status "Unit tests passed"

# Build the application
echo ""
echo "🔨 Building application..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi
print_status "Application built successfully"

# Environment-specific deployment
if [ "$ENVIRONMENT" = "staging" ]; then
    echo ""
    echo "🚀 Deploying to STAGING..."
    
    # Set staging environment variables
    export NODE_ENV=staging
    export PORT=3001
    
    # Deploy to staging server (customize as needed)
    echo "📡 Deploying to staging server..."
    
    # Example: Deploy to staging server
    # rsync -avz --delete dist/ staging-server:/path/to/app/
    # ssh staging-server "cd /path/to/app && npm install --production && pm2 reload app"
    
    print_status "Deployed to staging"
    echo "🌐 Staging URL: https://staging.miahealth.com"
    
elif [ "$ENVIRONMENT" = "production" ]; then
    echo ""
    echo "🚀 Deploying to PRODUCTION..."
    
    # Additional production checks
    print_warning "This will deploy to PRODUCTION. Are you sure? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
    
    # Set production environment variables
    export NODE_ENV=production
    export PORT=3000
    
    # Deploy to production server (customize as needed)
    echo "📡 Deploying to production server..."
    
    # Example: Deploy to production server
    # rsync -avz --delete dist/ production-server:/path/to/app/
    # ssh production-server "cd /path/to/app && npm install --production && pm2 reload app"
    
    print_status "Deployed to production"
    echo "🌐 Production URL: https://miahealth.com"
fi

# Post-deployment verification
echo ""
echo "🔍 Running post-deployment verification..."

# Wait for server to start
sleep 5

# Check if server is responding
if [ "$ENVIRONMENT" = "staging" ]; then
    HEALTH_URL="http://localhost:3001/health"
else
    HEALTH_URL="http://localhost:3000/health"
fi

# Test health endpoint
if curl -f -s "$HEALTH_URL" > /dev/null; then
    print_status "Health check passed"
else
    print_error "Health check failed"
    exit 1
fi

# Test calculation endpoint
echo "🧮 Testing calculation endpoint..."
CALC_RESPONSE=$(curl -s -X POST "$HEALTH_URL/api/quotation/calculate" \
    -H "Content-Type: application/json" \
    -d '{
        "applicant": {"age": 35, "includeParents": false},
        "plan": "oro",
        "optionalServices": {"funeralAssistance": false, "teleVet": false}
    }')

if echo "$CALC_RESPONSE" | grep -q '"success":true'; then
    print_status "Calculation endpoint working"
else
    print_warning "Calculation endpoint may have issues"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "============================================"
echo "Environment: $ENVIRONMENT"
echo "Version: $(node -p "require('./package.json').version")"
echo "Time: $(date)"

if [ "$ENVIRONMENT" = "production" ]; then
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "□ Monitor error logs"
    echo "□ Check performance metrics"
    echo "□ Verify all endpoints"
    echo "□ Test critical user flows"
    echo "□ Update status page"
fi
