# Personity Authentication Test Script (PowerShell)
# This script tests the authentication endpoints

$BaseUrl = "http://localhost:3000"
$CookieFile = "test-cookies.txt"

Write-Host "🧪 Personity Authentication Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Signup
Write-Host "📝 Test 1: User Signup" -ForegroundColor Yellow
Write-Host "----------------------"
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$signupBody = @{
    name = "Test User"
    email = "test-$timestamp@example.com"
    password = "TestPass123!"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/signup" `
        -Method POST `
        -ContentType "application/json" `
        -Body $signupBody `
        -SessionVariable session `
        -ErrorAction Stop
    
    Write-Host "✓ Signup successful (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "✗ Signup failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Login with valid credentials
Write-Host "🔐 Test 2: Login with Valid Credentials" -ForegroundColor Yellow
Write-Host "----------------------------------------"
$loginBody = @{
    email = "test@example.com"
    password = "TestPass123!"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -SessionVariable session `
        -ErrorAction Stop
    
    Write-Host "✓ Login successful (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "⚠ Login failed - user may not exist yet" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)"
}
Write-Host ""

# Test 3: Access protected route with cookie
Write-Host "🔒 Test 3: Access Protected Route (with auth)" -ForegroundColor Yellow
Write-Host "----------------------------------------------"
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/surveys" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    
    Write-Host "✓ Protected route accessible (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "✗ Protected route failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Login with invalid credentials
Write-Host "❌ Test 4: Login with Invalid Credentials" -ForegroundColor Yellow
Write-Host "------------------------------------------"
$invalidLoginBody = @{
    email = "test@example.com"
    password = "WrongPassword123!"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $invalidLoginBody `
        -ErrorAction Stop
    
    Write-Host "✗ Should have rejected invalid credentials" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Correctly rejected invalid credentials (HTTP 401)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Logout
Write-Host "👋 Test 5: Logout" -ForegroundColor Yellow
Write-Host "-----------------"
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/logout" `
        -Method POST `
        -WebSession $session `
        -ErrorAction Stop
    
    Write-Host "✓ Logout successful (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "✗ Logout failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Access protected route after logout
Write-Host "🚫 Test 6: Access Protected Route (after logout)" -ForegroundColor Yellow
Write-Host "------------------------------------------------"
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/surveys" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    
    Write-Host "✗ Should have rejected unauthorized request" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Correctly rejected unauthorized request (HTTP 401)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Test suite complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Make sure your dev server is running:" -ForegroundColor Yellow
Write-Host "  cd personity && npm run dev"
