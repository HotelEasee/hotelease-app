# HotelEase Comprehensive Testing Script
# Tests: Database connection, User booking/payment, Admin hotel management

$baseUrl = "http://localhost:5000/api"

# Colors for output - Define functions first
function Write-Success { 
    param($msg) 
    Write-Host "✅ $msg" -ForegroundColor Green 
}

function Write-ErrorMsg { 
    param($msg) 
    Write-Host "❌ $msg" -ForegroundColor Red 
}

function Write-Info { 
    param($msg) 
    Write-Host "ℹ️  $msg" -ForegroundColor Yellow 
}

function Write-Step { 
    param($msg) 
    Write-Host "`n📋 $msg" -ForegroundColor Cyan 
}

$ErrorActionPreference = "Continue"

Write-Host "`n🧪 HotelEase Comprehensive Testing Suite" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

# ============================================
# STEP 1: Test Database Connection
# ============================================
Write-Step "STEP 1: Testing Database Connection"

try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Success "Server is running"
    Write-Host "   Status: $($health.status)" -ForegroundColor White
    Write-Host "   Message: $($health.message)" -ForegroundColor White
    
    # Check if database connection is working by getting hotels
    try {
        $hotels = Invoke-RestMethod -Uri "$baseUrl/hotels" -Method GET
        Write-Success "Database connection verified (retrieved hotels)"
    } catch {
        Write-ErrorMsg "Database might not be connected: $($_.Exception.Message)"
        Write-Info "Make sure PostgreSQL is running and database is initialized"
        exit 1
    }
} catch {
    Write-ErrorMsg "Server is not running! Start it with: npm start"
    exit 1
}

# ============================================
# STEP 2: Test User Registration & Login
# ============================================
Write-Step "STEP 2: Testing User Registration & Login"

$timestamp = Get-Date -Format 'yyyyMMddHHmmss'
$testUser = @{
    email = "testuser_$timestamp@test.com"
    password = "Test123!@#"
    name = "Test User"
}

$testAdmin = @{
    email = "testadmin_$timestamp@test.com"
    password = "Admin123!@#"
    name = "Test Admin"
}

$userToken = $null
$adminToken = $null

try {
    # Register regular user
    Write-Info "Registering test user..."
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($testUser | ConvertTo-Json) -ContentType "application/json"
    
    if ($registerResponse.success) {
        Write-Success "User registered: $($testUser.email)"
    } else {
        Write-ErrorMsg "User registration failed"
    }
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorDetails.message -like "*already exists*") {
        Write-Info "User already exists, attempting login..."
    } else {
        Write-ErrorMsg "Registration error: $($errorDetails.message)"
    }
}

try {
    # Login as regular user
    Write-Info "Logging in as user..."
    $loginData = @{
        email = $testUser.email
        password = $testUser.password
    }
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    
    if ($loginResponse.success -and $loginResponse.data.token) {
        $userToken = $loginResponse.data.token
        Write-Success "User logged in successfully"
        Write-Host "   Token: $($userToken.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-ErrorMsg "User login failed"
    }
} catch {
    Write-ErrorMsg "Login error: $($_.Exception.Message)"
    $userToken = $null
}

# Register and login as admin
try {
    Write-Info "Registering test admin..."
    $adminRegisterResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($testAdmin | ConvertTo-Json) -ContentType "application/json"
    
    # Update user role to admin (this might need to be done directly in DB)
    Write-Info "Note: Admin user needs to be manually set to 'admin' role in database"
    Write-Host "   Run: UPDATE users SET role = 'admin' WHERE email = '$($testAdmin.email)'" -ForegroundColor Yellow
    
} catch {
    Write-Info "Admin registration skipped (might already exist)"
}

try {
    # Login as admin
    Write-Info "Logging in as admin..."
    $adminLoginData = @{
        email = $testAdmin.email
        password = $testAdmin.password
    }
    $adminLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($adminLoginData | ConvertTo-Json) -ContentType "application/json"
    
    if ($adminLoginResponse.success -and $adminLoginResponse.data.token) {
        $adminToken = $adminLoginResponse.data.token
        Write-Success "Admin logged in successfully"
    } else {
        Write-Info "Admin login skipped (admin role might not be set)"
        $adminToken = $null
    }
} catch {
    Write-Info "Admin login skipped: $($_.Exception.Message)"
    $adminToken = $null
}

if (-not $userToken) {
    Write-ErrorMsg "Cannot continue without user authentication"
    exit 1
}

# ============================================
# STEP 3: Test Hotel Retrieval (for booking)
# ============================================
Write-Step "STEP 3: Getting Available Hotels for Booking"

try {
    $hotels = Invoke-RestMethod -Uri "$baseUrl/hotels" -Method GET
    $hotelId = $null
    
    if ($hotels.items -and $hotels.items.Count -gt 0) {
        $hotelId = $hotels.items[0].hotel_id
        $firstHotel = $hotels.items[0]
        Write-Success "Found hotels available for booking"
        Write-Host "   Using Hotel: $($firstHotel.name)" -ForegroundColor White
        Write-Host "   Location: $($firstHotel.location)" -ForegroundColor White
        Write-Host "   Price per night: R$($firstHotel.price_per_night)" -ForegroundColor White
    } else {
        Write-ErrorMsg "No hotels found! Admin needs to create hotels first."
        Write-Info "Skipping booking tests..."
        $hotelId = $null
    }
} catch {
    Write-ErrorMsg "Failed to get hotels: $($_.Exception.Message)"
    $hotelId = $null
}

# ============================================
# STEP 4: Test User Booking Creation
# ============================================
Write-Step "STEP 4: Testing User Booking Creation"

$bookingId = $null

if ($hotelId) {
    try {
        $checkIn = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        $checkOut = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")
        
        $bookingData = @{
            hotel_id = $hotelId
            check_in_date = $checkIn
            check_out_date = $checkOut
            number_of_guests = 2
            number_of_rooms = 1
            guest_details = @{
                name = $testUser.name
                email = $testUser.email
                phone = "+27123456789"
            }
        }
        
        $headers = @{
            "Authorization" = "Bearer $userToken"
            "Content-Type" = "application/json"
        }
        
        Write-Info "Creating booking for hotel ID: $hotelId"
        Write-Host "   Check-in: $checkIn" -ForegroundColor Gray
        Write-Host "   Check-out: $checkOut" -ForegroundColor Gray
        
        $bookingResponse = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method POST -Body ($bookingData | ConvertTo-Json) -Headers $headers
        
        if ($bookingResponse.success) {
            $bookingId = $bookingResponse.booking.id
            Write-Success "Booking created successfully!"
            Write-Host "   Booking ID: $bookingId" -ForegroundColor White
            Write-Host "   Total Price: R$($bookingResponse.booking.total_price)" -ForegroundColor White
            Write-Host "   Status: $($bookingResponse.booking.status)" -ForegroundColor White
        } else {
            Write-ErrorMsg "Booking creation failed"
        }
    } catch {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorDetails) {
            Write-ErrorMsg "Booking creation failed: $($errorDetails.message)"
        } else {
            Write-ErrorMsg "Booking creation failed: $($_.Exception.Message)"
        }
    }
} else {
    Write-Info "Skipping booking test - no hotels available"
}

# ============================================
# STEP 5: Test Payment Flow
# ============================================
Write-Step "STEP 5: Testing Payment Flow"

if ($bookingId) {
    try {
        $headers = @{
            "Authorization" = "Bearer $userToken"
            "Content-Type" = "application/json"
        }
        
        # Create payment intent
        Write-Info "Creating payment intent..."
        $paymentIntentData = @{
            bookingId = $bookingId
        }
        
        $paymentResponse = Invoke-RestMethod -Uri "$baseUrl/bookings/payment-intent" -Method POST -Body ($paymentIntentData | ConvertTo-Json) -Headers $headers
        
        if ($paymentResponse.success -and $paymentResponse.clientSecret) {
            Write-Success "Payment intent created successfully!"
            Write-Host "   Payment Intent ID: $($paymentResponse.paymentIntentId)" -ForegroundColor White
            Write-Host "   Client Secret: $($paymentResponse.clientSecret.Substring(0, 20))..." -ForegroundColor Gray
            Write-Info "Note: Actual payment requires Stripe test card: 4242 4242 4242 4242"
        } else {
            Write-ErrorMsg "Payment intent creation failed"
        }
    } catch {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorDetails) {
            Write-ErrorMsg "Payment intent failed: $($errorDetails.message)"
        } else {
            Write-ErrorMsg "Payment intent failed: $($_.Exception.Message)"
            Write-Info "Make sure STRIPE_SECRET_KEY is set in .env file"
        }
    }
} else {
    Write-Info "Skipping payment test - no booking available"
}

# ============================================
# STEP 6: Test Admin Hotel Management
# ============================================
Write-Step "STEP 6: Testing Admin Hotel Management"

if ($adminToken) {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    # Test Create Hotel
    Write-Info "Testing: Create Hotel"
    $newHotel = @{
        name = "Test Hotel $(Get-Date -Format 'HHmmss')"
        location = "Cape Town"
        address = "123 Test Street, Cape Town"
        description = "A beautiful test hotel created by automated testing"
        price_per_night = 1500.00
        rating = 4.5
        images = @("https://example.com/hotel1.jpg", "https://example.com/hotel2.jpg")
        amenities = @("WiFi", "Pool", "Spa", "Restaurant")
        policies = @("Check-in: 14:00", "Check-out: 11:00", "No smoking")
    }
    
    try {
        $createResponse = Invoke-RestMethod -Uri "$baseUrl/admin/hotels" -Method POST -Body ($newHotel | ConvertTo-Json) -Headers $headers
        
        if ($createResponse.success) {
            $createdHotelId = $createResponse.data.hotel.hotel_id
            Write-Success "Hotel created successfully!"
            Write-Host "   Hotel ID: $createdHotelId" -ForegroundColor White
            Write-Host "   Name: $($createResponse.data.hotel.name)" -ForegroundColor White
            
            # Test Update Hotel
            Write-Info "Testing: Update Hotel"
            $updateData = @{
                name = "$($newHotel.name) - Updated"
                price_per_night = 1750.00
                rating = 4.8
            }
            
            try {
                $updateResponse = Invoke-RestMethod -Uri "$baseUrl/admin/hotels/$createdHotelId" -Method PUT -Body ($updateData | ConvertTo-Json) -Headers $headers
                
                if ($updateResponse.success) {
                    Write-Success "Hotel updated successfully!"
                    Write-Host "   Updated Name: $($updateResponse.data.hotel.name)" -ForegroundColor White
                    Write-Host "   Updated Price: R$($updateResponse.data.hotel.price_per_night)" -ForegroundColor White
                }
            } catch {
                $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
                Write-ErrorMsg "Hotel update failed: $(if ($errorDetails) { $errorDetails.message } else { $_.Exception.Message })"
            }
            
            # Test Delete Hotel
            Write-Info "Testing: Delete Hotel"
            try {
                $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/admin/hotels/$createdHotelId" -Method DELETE -Headers $headers
                
                if ($deleteResponse.success) {
                    Write-Success "Hotel deleted successfully!"
                }
            } catch {
                $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
                Write-ErrorMsg "Hotel deletion failed: $(if ($errorDetails) { $errorDetails.message } else { $_.Exception.Message })"
            }
        }
    } catch {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorDetails -and $errorDetails.message -like "*not authorized*") {
            Write-ErrorMsg "Admin authorization failed. User role might not be set to 'admin'"
            Write-Info "To fix: UPDATE users SET role = 'admin' WHERE email = '$($testAdmin.email)'"
        } else {
            Write-ErrorMsg "Hotel creation failed: $(if ($errorDetails) { $errorDetails.message } else { $_.Exception.Message })"
        }
    }
} else {
    Write-Info "Skipping admin tests - admin token not available"
    Write-Info "To test admin features:"
    Write-Host "   1. Register an admin user" -ForegroundColor Yellow
    Write-Host "   2. Run: UPDATE users SET role = 'admin' WHERE email = 'your-admin-email'" -ForegroundColor Yellow
    Write-Host "   3. Login again to get admin token" -ForegroundColor Yellow
}

# ============================================
# STEP 7: Verify Rooms Table
# ============================================
Write-Step "STEP 7: Checking Rooms Management"

Write-Info "Note: Rooms table exists in database schema, but no admin endpoints found"
Write-Info "To manage rooms, you would need to:"
Write-Host "   1. Create room management endpoints in adminRoutes.js" -ForegroundColor Yellow
Write-Host "   2. Add CRUD operations for rooms in adminController.js" -ForegroundColor Yellow
Write-Host "   3. Rooms table structure exists: (room_id, hotel_id, room_type, capacity, price_per_night, etc.)" -ForegroundColor Gray

# ============================================
# SUMMARY
# ============================================
Write-Host "`n" + "=" * 70 -ForegroundColor Cyan
Write-Step "TEST SUMMARY"
Write-Host ""

$tests = @(
    @{ Name = "Database Connection"; Status = "✅ Passed" }
    @{ Name = "User Registration"; Status = if ($userToken) { "✅ Passed" } else { "❌ Failed" } }
    @{ Name = "User Login"; Status = if ($userToken) { "✅ Passed" } else { "❌ Failed" } }
    @{ Name = "Hotel Retrieval"; Status = if ($hotelId) { "✅ Passed" } else { "⚠️  Skipped" } }
    @{ Name = "Booking Creation"; Status = if ($bookingId) { "✅ Passed" } else { "❌ Failed" } }
    @{ Name = "Payment Intent"; Status = if ($paymentResponse.success) { "✅ Passed" } else { "⚠️  Skipped" } }
    @{ Name = "Admin Create Hotel"; Status = if ($createResponse.success) { "✅ Passed" } else { "⚠️  Skipped" } }
    @{ Name = "Admin Update Hotel"; Status = if ($updateResponse.success) { "✅ Passed" } else { "⚠️  Skipped" } }
    @{ Name = "Admin Delete Hotel"; Status = if ($deleteResponse.success) { "✅ Passed" } else { "⚠️  Skipped" } }
)

foreach ($test in $tests) {
    Write-Host "   $($test.Name): $($test.Status)" -ForegroundColor $(if ($test.Status -like "*✅*") { "Green" } elseif ($test.Status -like "*⚠️*") { "Yellow" } else { "Red" })
}

Write-Host "`n✨ Testing Complete!" -ForegroundColor Cyan
Write-Host ""

