# Firebase Storage CORS Configuration Script
# This script applies CORS configuration to your Firebase Storage bucket

param(
    [Parameter(Mandatory=$true)]
    [string]$BucketName,
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectId
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase Storage CORS Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if gsutil is installed
$gsutilCheck = Get-Command gsutil -ErrorAction SilentlyContinue
if (-not $gsutilCheck) {
    Write-Host "ERROR: gsutil is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Google Cloud SDK:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    Write-Host "2. Or run: (New-Object Net.WebClient).DownloadFile('https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe', `$env:Temp\GoogleCloudSDKInstaller.exe); & `$env:Temp\GoogleCloudSDKInstaller.exe" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✓ gsutil found" -ForegroundColor Green
Write-Host ""

# Check if authenticated
Write-Host "Checking authentication..." -ForegroundColor Yellow
$authCheck = gcloud auth list 2>&1
if ($authCheck -match "No credentialed accounts") {
    Write-Host "ERROR: Not authenticated with Google Cloud" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run: gcloud auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Authenticated" -ForegroundColor Green
Write-Host ""

# Set project if provided
if ($ProjectId) {
    Write-Host "Setting project to: $ProjectId" -ForegroundColor Yellow
    gcloud config set project $ProjectId
    Write-Host "✓ Project set" -ForegroundColor Green
    Write-Host ""
}

# Get CORS file path
$corsFile = Join-Path $PSScriptRoot "..\cors.json"
if (-not (Test-Path $corsFile)) {
    Write-Host "ERROR: cors.json not found at: $corsFile" -ForegroundColor Red
    exit 1
}

Write-Host "CORS configuration file: $corsFile" -ForegroundColor Cyan
Write-Host "Bucket name: gs://$BucketName" -ForegroundColor Cyan
Write-Host ""

# Apply CORS
Write-Host "Applying CORS configuration..." -ForegroundColor Yellow
$result = gsutil cors set $corsFile "gs://$BucketName" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ CORS configuration applied successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Verify CORS
    Write-Host "Verifying CORS configuration..." -ForegroundColor Yellow
    gsutil cors get "gs://$BucketName"
    Write-Host ""
    Write-Host "✓ CORS configuration verified" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to apply CORS configuration" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CORS Configuration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

