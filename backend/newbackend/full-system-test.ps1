# Full System Test for HotelEase
$baseUrl = "http://localhost:5000/api"
$results = @{}

function Test-Step {
    param($Name, $Script)
    Write-Host "`n[$Name]" -ForegroundColor Cyan
    try {
        & $Script
        Write-Host "  ✅ PASSED" -ForegroundColor Green
        $results[$Name] = "PASSED"
        return $true
    } catch {
        Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $results[$Name] = "FAILED: $($_.Exception.Message)"
        return $false
    }
}

Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "  HotelEase Full System Test" -ForegroundColor Cyan  
Write-Host "="*60 -ForegroundColor Cyan

# Test 1: Database Connection
Test-Step "1. Database Connection" {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    if ($health.status -ne "success") { throw "Health check failed" }
    $hotels = Invoke-RestMethod -Uri "$baseUrl/hotels" -Method GET
    if ($hotels.items.Count -eq 0) { throw "No hotels in database" }
}

# Test 2: User Registration
$timestamp = Get-Date -Format 'yyyyMMddHHmmss'
$testEmail = "systemtest_$timestamp@test.com"
$testPassword = "Test123!@#"
$userToken = $null

Test-Step "2. User Registration" {
    $userData = @{
        email = $testEmail
        password = $testPassword
        first_name = "Test"
        last_name = "User"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $userData -ContentType "application/json"
    if (-not $response.success) { throw "Registration failed" }
}

# Test 3: User Login
Test-Step "3. User Login" {
    $loginData = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    if (-not $response.success -or -not $response.data.token) { throw "Login failed" }
    $script:userToken = $response.data.token
}

# Test 4: Get Hotels
$hotelId = $null
Test-Step "4. Get Hotels" {
    $response = Invoke-RestMethod -Uri "$baseUrl/hotels" -Method GET
    if ($response.items.Count -eq 0) { throw "No hotels found" }
    $script:hotelId = $response.items[0].id
    Write-Host "    Found hotel: $($response.items[0].name)" -ForegroundColor Gray
}

# Test 5: Create Booking
$bookingId = $null
Test-Step "5. Create Booking" {
    if (-not $userToken -or -not $hotelId) { throw "Missing token or hotel ID" }
    
    $bookingData = @{
        hotel_id = $hotelId
        check_in_date = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        check_out_date = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")
        number_of_guests = 2
        number_of_rooms = 1
    } | ConvertTo-Json
    
    $headers = @{ Authorization = "Bearer $userToken" }
    $response = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method POST -Body $bookingData -ContentType "application/json" -Headers $headers
    if (-not $response.success) { throw "Booking creation failed" }
    $script:bookingId = $response.booking.id
    Write-Host "    Booking ID: $bookingId" -ForegroundColor Gray
    Write-Host "    Total Price: R$($response.booking.total_price)" -ForegroundColor Gray
}

# Test 6: Create Payment Intent
Test-Step "6. Create Payment Intent" {
    if (-not $userToken -or -not $bookingId) { throw "Missing token or booking ID" }
    
    $paymentData = @{
        bookingId = $bookingId
    } | ConvertTo-Json
    
    $headers = @{ Authorization = "Bearer $userToken" }
    $response = Invoke-RestMethod -Uri "$baseUrl/bookings/payment-intent" -Method POST -Body $paymentData -ContentType "application/json" -Headers $headers
    if (-not $response.success) { throw "Payment intent creation failed" }
    Write-Host "    Payment Intent ID: $($response.paymentIntentId)" -ForegroundColor Gray
}

# Test 7: Admin Registration & Setup
$adminEmail = "adminsystemtest_$timestamp@test.com"
$adminToken = $null

Test-Step "7. Admin Registration" {
    $adminData = @{
        email = $adminEmail
        password = "Admin123!@#"
        first_name = "Admin"
        last_name = "Test"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $adminData -ContentType "application/json"
    if (-not $response.success) { throw "Admin registration failed" }
    
    # Set admin role
    node set-admin-role.js $adminEmail | Out-Null
    Start-Sleep -Seconds 1
}

# Test 8: Admin Login
Test-Step "8. Admin Login" {
    $loginData = @{
        email = $adminEmail
        password = "Admin123!@#"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    if (-not $response.success -or $response.data.user.role -ne "admin") { throw "Admin login or role check failed" }
    $script:adminToken = $response.data.token
}

# Test 9: Admin Create Hotel
$createdHotelId = $null
Test-Step "9. Admin Create Hotel" {
    if (-not $adminToken) { throw "Missing admin token" }
    
    $hotelData = @{
        name = "System Test Hotel $timestamp"
        location = "Cape Town"
        address = "123 Test Street"
        description = "Test hotel created by system test"
        price_per_night = 2000
        rating = 4.5
    } | ConvertTo-Json
    
    $headers = @{ Authorization = "Bearer $adminToken" }
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/hotels" -Method POST -Body $hotelData -ContentType "application/json" -Headers $headers
    if (-not $response.success) { throw "Hotel creation failed" }
    $script:createdHotelId = $response.data.hotel.id
    Write-Host "    Created Hotel ID: $createdHotelId" -ForegroundColor Gray
}

# Test 10: Admin Update Hotel
Test-Step "10. Admin Update Hotel" {
    if (-not $adminToken -or -not $createdHotelId) { throw "Missing admin token or hotel ID" }
    
    $updateData = @{
        name = "System Test Hotel $timestamp - UPDATED"
        price_per_night = 2500
        rating = 4.8
    } | ConvertTo-Json
    
    $headers = @{ Authorization = "Bearer $adminToken" }
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/hotels/$createdHotelId" -Method PUT -Body $updateData -ContentType "application/json" -Headers $headers
    if (-not $response.success) { throw "Hotel update failed" }
    Write-Host "    Updated price: R$($response.data.hotel.price_per_night)" -ForegroundColor Gray
}

# Test 11: Admin Delete Hotel
Test-Step "11. Admin Delete Hotel" {
    if (-not $adminToken -or -not $createdHotelId) { throw "Missing admin token or hotel ID" }
    
    $headers = @{ Authorization = "Bearer $adminToken" }
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/hotels/$createdHotelId" -Method DELETE -Headers $headers
    if (-not $response.success) { throw "Hotel deletion failed" }
}

# Summary
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

$passed = 0
$failed = 0
foreach ($key in $results.Keys | Sort-Object) {
    $status = $results[$key]
    $color = if ($status -like "PASSED*") { "Green" } else { "Red" }
    Write-Host "$key : $status" -ForegroundColor $color
    if ($status -like "PASSED*") { $passed++ } else { $failed++ }
}

Write-Host "`nTotal: $($results.Count) tests" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

if ($failed -eq 0) {
    Write-Host "`n✨ ALL TESTS PASSED! System is working correctly." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Please check the errors above." -ForegroundColor Yellow
}

