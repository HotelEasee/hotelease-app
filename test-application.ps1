# HotelEase Application Test Script
# This script will help test the application

Write-Host "🧪 HotelEase Application Testing" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check Backend
Write-Host "🔧 Checking Backend..." -ForegroundColor Yellow
Set-Location backend/newbackend

if (-not (Test-Path node_modules)) {
    Write-Host "📥 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend dependencies installation failed" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Creating from env.example..." -ForegroundColor Yellow
    if (Test-Path env.example) {
        Copy-Item env.example .env
        Write-Host "✅ Created .env file. Please configure it with your database credentials." -ForegroundColor Green
    } else {
        Write-Host "❌ env.example not found" -ForegroundColor Red
    }
}

Write-Host "✅ Backend setup complete" -ForegroundColor Green
Write-Host ""

# Check Frontend
Write-Host "🎨 Checking Frontend..." -ForegroundColor Yellow
Set-Location ../../frontend

if (-not (Test-Path node_modules)) {
    Write-Host "📥 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend dependencies installation failed" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path .env)) {
    Write-Host "⚠️  Frontend .env file not found. Creating..." -ForegroundColor Yellow
    @"
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SK4EeKfsjeetxhkHtYVFBzhUtFiyf4o03PVURBPyUuJH6EJlFXArNq2Cg64kuSDrAJ1JDHJoWpl29hO82hlUjXz00ldCqwN5Y
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host "✅ Created frontend .env file" -ForegroundColor Green
}

Write-Host "✅ Frontend setup complete" -ForegroundColor Green
Write-Host ""

# Instructions
Write-Host "🚀 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 - Backend:" -ForegroundColor Yellow
Write-Host "  cd backend/newbackend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 - Frontend:" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Make sure PostgreSQL is running and configured in backend/.env" -ForegroundColor Yellow
Write-Host ""

Set-Location ../..

