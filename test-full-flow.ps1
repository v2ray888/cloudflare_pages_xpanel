# Test full flow PowerShell script

Write-Host "Starting full flow test..." -ForegroundColor Green

# 1. Test health check endpoint
Write-Host "1. Testing health check endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = irm -Method GET -Uri "https://xpanel.121858.xyz/api/health" -ContentType "application/json"
    Write-Host "Health check response: $($healthResponse | ConvertTo-Json -Depth 10)" -ForegroundColor Cyan
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test login and get token
Write-Host "2. Testing login and getting token..." -ForegroundColor Yellow
try {
    $loginResponse = irm -Method POST -Uri "https://xpanel.121858.xyz/api/auth/login" -Body '{"email": "admin@xpanel.com", "password": "admin123"}' -ContentType "application/json"
    Write-Host "Login response: $($loginResponse | ConvertTo-Json -Depth 10)" -ForegroundColor Cyan
    
    # Check if token exists
    if ($loginResponse.data -and $loginResponse.data.token) {
        $token = $loginResponse.data.token
        Write-Host "Successfully obtained token: $token" -ForegroundColor Green
    } else {
        Write-Host "Login successful but no token returned" -ForegroundColor Red
        $token = $null
    }
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    $token = $null
}

# 3. If token obtained, test admin API
if ($token) {
    Write-Host "3. Testing admin API..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $planData = @{
            name = "Test Plan"
            price = 10
            duration_days = 30
            traffic_gb = 100
        } | ConvertTo-Json
        
        Write-Host "Sending create plan request..." -ForegroundColor Yellow
        $planResponse = irm -Method POST -Uri "https://xpanel.121858.xyz/api/admin/plans" -Body $planData -Headers $headers
        Write-Host "Plan creation response: $($planResponse | ConvertTo-Json -Depth 10)" -ForegroundColor Cyan
    } catch {
        Write-Host "Admin API call failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Response content: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "No token obtained, skipping admin API test" -ForegroundColor Yellow
}

Write-Host "Test completed" -ForegroundColor Green