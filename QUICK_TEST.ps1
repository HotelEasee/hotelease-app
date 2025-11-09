# Quick Test Script for HotelEase
Write-Host "🧪 HotelEase Quick Test" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

# Test Backend Health
Write-Host "Testing Backend API..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Message: $($health.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Make sure backend is running:" -ForegroundColor Yellow
    Write-Host "   cd backend/newbackend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    exit 1
}

Write-Host ""

# Test Hotels Endpoint
Write-Host "Testing Hotels API..." -ForegroundColor Yellow
try {
    $hotels = Invoke-RestMethod -Uri "http://localhost:5000/api/hotels" -Method Get -TimeoutSec 5
    Write-Host "✅ Hotels API working!" -ForegroundColor Green
    $count = if ($hotels.items) { $hotels.items.Count } elseif ($hotels.data?.items) { $hotels.data.items.Count } else { $hotels.length }
    Write-Host "   Found $count hotels" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Hotels API error (may be empty or need auth)" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Basic backend tests complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend should be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 To test full application:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:5173 in browser" -ForegroundColor White
Write-Host "   2. Follow the testing checklist in START_APPLICATION.md" -ForegroundColor White
Write-Host ""

