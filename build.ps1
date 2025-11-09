# Build script for Render deployment (PowerShell version)
# This script builds the frontend and sets up the backend

$ErrorActionPreference = "Stop"

Write-Host "🔨 Building frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install
npm run build
Set-Location ..

Write-Host "🔨 Setting up backend..." -ForegroundColor Cyan
Set-Location backend/newbackend
npm install
Set-Location ../..

Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host "Frontend build is at: frontend/dist"
Write-Host "Backend is ready at: backend/newbackend"

