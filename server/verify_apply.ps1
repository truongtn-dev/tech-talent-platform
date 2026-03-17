$baseUrl = "http://127.0.0.1:5000/api"
$candidateEmail = "candidate@tech.com"
$password = "Techtalent123@"

# 1. Login
Write-Host "Logging in..."
$loginRes = curl.exe -s -X POST "$baseUrl/auth/login" -H "Content-Type: application/json" -d "{`"email`":`"$candidateEmail`",`"password`":`"$password`"}"
$token = ($loginRes | ConvertFrom-Json).token
Write-Host "Token obtained: $token"

# 2. Get Jobs
Write-Host "Fetching jobs..."
$jobsRes = curl.exe -s -X GET "$baseUrl/jobs"
$jobs = $jobsRes | ConvertFrom-Json
$job = $jobs | Where-Object { $_.title -like "*MERN*" } | Select-Object -First 1
$jobId = $job._id
Write-Host "Job ID: $jobId"

# 3. Apply
Write-Host "Applying..."
$applyRes = curl.exe -s -X POST "$baseUrl/applications" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "{`"jobId`":`"$jobId`",`"cvType`":`"PROFILE`"}"
Write-Host "Apply Response: $applyRes"
