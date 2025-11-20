#!/bin/bash

echo "🚀 Craftify Deployment Preparation Script"
echo "=========================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin YOUR_GITHUB_REPO_URL"
    echo "   git push -u origin main"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Checking project structure..."

# Check required files
files=("render.yaml" "Dockerfile" "Dockerfile.frontend" "backend/package.json" "frontend/package.json")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check environment files
echo ""
echo "📋 Environment Configuration:"
if [ -f "backend/.env.production" ]; then
    echo "✅ Backend production env template created"
else
    echo "❌ Backend production env template missing"
fi

if [ -f "frontend/.env.production" ]; then
    echo "✅ Frontend production env template created"
else
    echo "❌ Frontend production env template missing"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Set up MongoDB Atlas database"
echo "2. Push code to GitHub"
echo "3. Create Render account"
echo "4. Deploy using Render Blueprint or manual setup"
echo "5. Configure environment variables in Render"
echo ""
echo "📖 Read RENDER_DEPLOYMENT_GUIDE.md for detailed instructions"