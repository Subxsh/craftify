# Craftify Deployment Preparation Script for Windows
Write-Host "🚀 Craftify Deployment Preparation Script" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not found. Please initialize git first:" -ForegroundColor Red
    Write-Host "   git init" -ForegroundColor Yellow
    Write-Host "   git add ." -ForegroundColor Yellow
    Write-Host "   git commit -m 'Initial commit'" -ForegroundColor Yellow
    Write-Host "   git remote add origin YOUR_GITHUB_REPO_URL" -ForegroundColor Yellow
    Write-Host "   git push -u origin main" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "render.yaml")) {
    Write-Host "❌ render.yaml not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Checking project structure..." -ForegroundColor Green

# Check required files
$files = @("render.yaml", "Dockerfile", "Dockerfile.frontend", "backend/package.json", "frontend/package.json")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
    }
}

# Check environment files
Write-Host ""
Write-Host "📋 Environment Configuration:" -ForegroundColor Cyan
if (Test-Path "backend/.env.production") {
    Write-Host "✅ Backend production env template created" -ForegroundColor Green
} else {
    Write-Host "❌ Backend production env template missing" -ForegroundColor Red
}

if (Test-Path "frontend/.env.production") {
    Write-Host "✅ Frontend production env template created" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend production env template missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Set up MongoDB Atlas database" -ForegroundColor White
Write-Host "2. Push code to GitHub" -ForegroundColor White
Write-Host "3. Create Render account" -ForegroundColor White
Write-Host "4. Deploy using Render Blueprint or manual setup" -ForegroundColor White
Write-Host "5. Configure environment variables in Render" -ForegroundColor White
Write-Host ""
Write-Host "📖 Read RENDER_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Yellow