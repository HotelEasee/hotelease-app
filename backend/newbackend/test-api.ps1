# HotelEase API Testing Script for PowerShell

Write-Host "🧪 Testing HotelEase API" -ForegroundColor Cyan
Write-Host "=" * 50

# 1. Test Health Endpoint
Write-Host "`n1️⃣ Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health"
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)"
    Write-Host "   Message: $($health.message)"
} catch {
    Write-Host "❌ Server is not running!" -ForegroundColor Red
    Write-Host "   Make sure to start the server first: npm start" -ForegroundColor Yellow
    exit 1
}

# 2. Test Get All Hotels
Write-Host "`n2️⃣ Testing Get All Hotels..." -ForegroundColor Yellow
try {
    $hotels = Invoke-RestMethod -Uri "http://localhost:5000/api/hotels"
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "   Total Hotels: $($hotels.total)"
    Write-Host "   Page: $($hotels.page)"
    Write-Host "   Items Returned: $($hotels.items.Count)"
    
    if ($hotels.items.Count -gt 0) {
        Write-Host "`n   First Hotel:" -ForegroundColor Cyan
        Write-Host "   - Name: $($hotels.items[0].name)"
        Write-Host "   - Location: $($hotels.items[0].location)"
        Write-Host "   - Price: $($hotels.items[0].price_per_night)"
    } else {
        Write-Host "   No hotels found in database" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to get hotels: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test Get Single Hotel (if hotels exist)
Write-Host "`n3️⃣ Testing Get Single Hotel..." -ForegroundColor Yellow
try {
    $hotels = Invoke-RestMethod -Uri "http://localhost:5000/api/hotels"
    if ($hotels.items.Count -gt 0) {
        $firstHotelId = $hotels.items[0].hotel_id
        $hotel = Invoke-RestMethod -Uri "http://localhost:5000/api/hotels/$firstHotelId"
        Write-Host "✅ Success!" -ForegroundColor Green
        Write-Host "   Hotel ID: $($hotel.hotel_id)"
        Write-Host "   Name: $($hotel.name)"
    } else {
        Write-Host "⚠️  No hotels to test with" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + "=" * 50
Write-Host "✨ Testing Complete!" -ForegroundColor Cyan

