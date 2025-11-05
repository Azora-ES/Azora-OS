# AZORA PROPRIETARY LICENSE
# Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
#
# Parallel dependency installation for Windows (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Installing all education service dependencies in parallel..." -ForegroundColor Cyan
Write-Host ""

$services = @(
    "services/azora-education",
    "services/azora-assessment",
    "services/azora-content",
    "services/azora-analytics",
    "services/azora-credentials",
    "services/azora-collaboration",
    "services/azora-education-payments",
    "services/azora-media",
    "services/azora-lms",
    "services/azora-sapiens",
    "services/azora-institutional-system",
    "services/azora-virtual-library",
    "services/azora-virtual-career",
    "services/azora-virtual-counseling"
)

$jobs = @()

foreach ($service in $services) {
    if (Test-Path $service -PathType Container) {
        if (Test-Path "$service/package.json") {
            Write-Host "📦 Queuing installation for $service..." -ForegroundColor Blue
            
            $job = Start-Job -ScriptBlock {
                param($servicePath)
                Set-Location $servicePath
                npm install --silent 2>&1 | ForEach-Object { Write-Output "[$(Split-Path $servicePath -Leaf)] $_" }
            } -ArgumentList (Resolve-Path $service)
            
            $jobs += $job
            Write-Host "✅ Queued: $service" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Skipping $service (no package.json found)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "⏳ Waiting for all installations to complete..." -ForegroundColor Cyan

# Wait for all jobs with progress
$completed = 0
$total = $jobs.Count

while ($jobs | Where-Object { $_.State -eq "Running" }) {
    $running = ($jobs | Where-Object { $_.State -eq "Running" }).Count
    $currentCompleted = $total - $running
    if ($currentCompleted -ne $completed) {
        $completed = $currentCompleted
        Write-Progress -Activity "Installing dependencies" -Status "Completed: $completed/$total" -PercentComplete (($completed / $total) * 100)
    }
    Start-Sleep -Milliseconds 500
}

Write-Progress -Activity "Installing dependencies" -Completed

# Get results
$failed = 0
foreach ($job in $jobs) {
    $result = Receive-Job $job
    $jobPath = $job.Arguments[0]
    $serviceName = Split-Path $jobPath -Leaf
    
    if ($job.State -eq "Completed") {
        Write-Host "✅ $serviceName: Installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ $serviceName: Failed" -ForegroundColor Red
        $failed++
    }
    Remove-Job $job
}

Write-Host ""
if ($failed -eq 0) {
    Write-Host "🎉 All services ready!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  $failed service(s) failed installation" -ForegroundColor Yellow
    exit 1
}
