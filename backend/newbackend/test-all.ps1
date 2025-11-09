# Simplified HotelEase Test Script
$baseUrl = "http://localhost:5000/api"
$results = @()

function Test-Endpoint {
    param($Name, $Method, $Uri, $Body = $null, $Headers = $null)
    
    Write-Host "`n[TEST] $Name" -ForegroundColor Cyan
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        if ($Headers) {
            $params.Headers = $Headers
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "  [PASS] $Name" -ForegroundColor Green
        return @{ Success = $true; Data = $response }
    } catch {
        Write-Host "  [FAIL] $Name : $($_.Exception.Message)" -ForegroundColor Red
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  HotelEase Comprehensive Test Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Database Connection
Write-Host "`n[1] Testing Database Connection..." -ForegroundColor Yellow
$health = Test-Endpoint -Name "Health Check" -Method "GET" -Uri "$baseUrl/health"
if ($health.Success) {
    $hotels = Test-Endpoint -Name "Get Hotels (DB Test)" -Method "GET" -Uri "$baseUrl/hotels"
    $hotelId = $null
    if ($hotels.Success -and $hotels.Data.items -and $hotels.Data.items.Count -gt 0) {
        $hotelId = $hotels.Data.items[0].hotel_id
        Write-Host "  Found hotel ID: $hotelId" -ForegroundColor Gray
    }
}

# Test 2: User Registration & Login
Write-Host "`n[2] Testing User Registration & Login..." -ForegroundColor Yellow
$timestamp = Get-Date -Format 'yyyyMMddHHmmss'
$testUser = @{
    email = "testuser_$timestamp@test.com"
    password = "Test123!@#"
    name = "Test User"
}

$register = Test-Endpoint -Name "Register User" -Method "POST" -Uri "$baseUrl/auth/register" -Body $testUser
$userToken = $null

if ($register.Success) {
    $loginData = @{
        email = $testUser.email
        password = $testUser.password
    }
    $login = Test-Endpoint -Name "Login User" -Method "POST" -Uri "$baseUrl/auth/login" -Body $loginData
    
    if ($login.Success -and $login.Data.data.token) {
        $userToken = $login.Data.data.token
        Write-Host "  User token obtained" -ForegroundColor Gray
    }
} else {
    # Try login if registration failed (user might exist)
    $loginData = @{
        email = $testUser.email
        password = $testUser.password
    }
    $login = Test-Endpoint -Name "Login User (existing)" -Method "POST" -Uri "$baseUrl/auth/login" -Body $loginData
    if ($login.Success -and $login.Data.data.token) {
        $userToken = $login.Data.data.token
    }
}

# Test 3: Booking Creation
Write-Host "`n[3] Testing Booking Creation..." -ForegroundColor Yellow
$bookingId = $null

if ($userToken -and $hotelId) {
    $checkIn = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    $checkOut = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")
    
    $bookingData = @{
        hotel_id = $hotelId
        check_in_date = $checkIn
        check_out_date = $checkOut
        number_of_guests = 2
        number_of_rooms = 1
    }
    
    $headers = @{
        "Authorization" = "Bearer $userToken"
    }
    
    $booking = Test-Endpoint -Name "Create Booking" -Method "POST" -Uri "$baseUrl/bookings" -Body $bookingData -Headers $headers
    
    if ($booking.Success) {
        $bookingId = $booking.Data.booking.id
        Write-Host "  Booking created: $bookingId" -ForegroundColor Gray
        Write-Host "  Total: R$($booking.Data.booking.total_price)" -ForegroundColor Gray
    }
} else {
    Write-Host "  [SKIP] No user token or hotel ID" -ForegroundColor Yellow
}

# Test 4: Payment Flow
Write-Host "`n[4] Testing Payment Flow..." -ForegroundColor Yellow
if ($userToken -and $bookingId) {
    $paymentData = @{
        bookingId = $bookingId
    }
    
    $headers = @{
        "Authorization" = "Bearer $userToken"
    }
    
    $payment = Test-Endpoint -Name "Create Payment Intent" -Method "POST" -Uri "$baseUrl/bookings/payment-intent" -Body $paymentData -Headers $headers
    
    if ($payment.Success) {
        Write-Host "  Payment intent created" -ForegroundColor Gray
        Write-Host "  Intent ID: $($payment.Data.paymentIntentId)" -ForegroundColor Gray
    }
} else {
    Write-Host "  [SKIP] No booking available" -ForegroundColor Yellow
}

# Test 5: Admin Operations
Write-Host "`n[5] Testing Admin Operations..." -ForegroundColor Yellow

# Register admin
$testAdmin = @{
    email = "testadmin_$timestamp@test.com"
    password = "Admin123!@#"
    name = "Test Admin"
}

$adminRegister = Test-Endpoint -Name "Register Admin" -Method "POST" -Uri "$baseUrl/auth/register" -Body $testAdmin
$adminToken = $null

if ($adminRegister.Success) {
    $adminLoginData = @{
        email = $testAdmin.email
        password = $testAdmin.password
    }
    $adminLogin = Test-Endpoint -Name "Login Admin" -Method "POST" -Uri "$baseUrl/auth/login" -Body $adminLoginData
    
    if ($adminLogin.Success) {
        $adminToken = $adminLogin.Data.data.token
        Write-Host "  [NOTE] Set admin role in DB: UPDATE users SET role = 'admin' WHERE email = '$($testAdmin.email)'" -ForegroundColor Yellow
    }
}

if ($adminToken) {
    $adminHeaders = @{
        "Authorization" = "Bearer $adminToken"
    }
    
    # Create Hotel
    $newHotel = @{
        name = "Test Hotel $timestamp"
        location = "Cape Town"
        address = "123 Test St"
        description = "Test hotel"
        price_per_night = 1500
        rating = 4.5
        images = @()
        amenities = @("WiFi", "Pool")
        policies = @()
    }
    
    $createHotel = Test-Endpoint -Name "Create Hotel" -Method "POST" -Uri "$baseUrl/admin/hotels" -Body $newHotel -Headers $adminHeaders
    
    if ($createHotel.Success) {
        $createdHotelId = $createHotel.Data.data.hotel.hotel_id
        Write-Host "  Hotel created: $createdHotelId" -ForegroundColor Gray
        
        # Update Hotel
        $updateData = @{
            name = "$($newHotel.name) - Updated"
            price_per_night = 1750
        }
        $updateHotel = Test-Endpoint -Name "Update Hotel" -Method "PUT" -Uri "$baseUrl/admin/hotels/$createdHotelId" -Body $updateData -Headers $adminHeaders
        
        # Delete Hotel
        $deleteHotel = Test-Endpoint -Name "Delete Hotel" -Method "DELETE" -Uri "$baseUrl/admin/hotels/$createdHotelId" -Headers $adminHeaders
    }
} else {
    Write-Host "  [SKIP] Admin token not available" -ForegroundColor Yellow
    Write-Host "  [NOTE] To test admin: Set user role to 'admin' in database" -ForegroundColor Gray
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Database Connection: $($hotels.Success)" -ForegroundColor $(if ($hotels.Success) { "Green" } else { "Red" })
Write-Host "User Registration:   $($register.Success)" -ForegroundColor $(if ($register.Success) { "Green" } else { "Red" })
Write-Host "User Login:          $(if ($userToken) { 'Success' } else { 'Failed' })" -ForegroundColor $(if ($userToken) { "Green" } else { "Red" })
Write-Host "Booking Creation:   $(if ($bookingId) { 'Success' } else { 'Skipped' })" -ForegroundColor $(if ($bookingId) { "Green" } else { "Yellow" })
Write-Host "Payment Intent:     $(if ($payment.Success) { 'Success' } else { 'Skipped' })" -ForegroundColor $(if ($payment.Success) { "Green" } else { "Yellow" })
Write-Host "Admin Operations:   $(if ($createHotel.Success) { 'Success' } else { 'Skipped - Set admin role' })" -ForegroundColor $(if ($createHotel.Success) { "Green" } else { "Yellow" })

Write-Host "`n✨ Testing Complete!`n" -ForegroundColor Cyan

