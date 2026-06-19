param(
    [string]$IP = $env:DROPLET_IP,
    [string]$Key = $env:SSH_KEY_PATH,
    [string]$User = "root",
    [switch]$Cookies,
    [switch]$CodeOnly
)

if (-not $IP) {
    Write-Host "Error: No droplet IP. Set DROPLET_IP env var or pass -IP <address>" -ForegroundColor Red
    exit 1
}

$sshArgs = @()
if ($Key) { $sshArgs += @("-i", $Key) }
$remote = "$User@$IP"
$remotePath = "~/iroh-bot"

# Upload cookies if requested
if ($Cookies) {
    $cookiesFile = Join-Path $PSScriptRoot "cookies.txt"
    if (-not (Test-Path $cookiesFile)) {
        Write-Host "Error: cookies.txt not found in project root" -ForegroundColor Red
        exit 1
    }
    Write-Host "Uploading cookies.txt..." -ForegroundColor Cyan
    $scpArgs = @()
    if ($Key) { $scpArgs += @("-i", $Key) }
    scp @scpArgs $cookiesFile "${remote}:${remotePath}/cookies.txt"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to upload cookies" -ForegroundColor Red
        exit 1
    }
    Write-Host "Cookies uploaded." -ForegroundColor Green
    if ($CodeOnly) {
        Write-Host "Skipping rebuild (-CodeOnly with -Cookies just uploads cookies)." -ForegroundColor Yellow
    }
}

# Deploy code
if (-not $CodeOnly -or -not $Cookies) {
    Write-Host "Deploying to $remote..." -ForegroundColor Cyan

    $deployScript = @"
set -e
cd $remotePath
echo ':: Pulling latest code...'
git pull
echo ':: Stopping old container...'
docker stop iroh-bot && docker rm iroh-bot || true
echo ':: Building image...'
docker build -t iroh-bot .
echo ':: Starting container...'
docker run -d --restart unless-stopped --env-file .env.prod --name iroh-bot iroh-bot
echo ':: Done! Showing recent logs...'
docker logs --tail 20 iroh-bot
"@

    ssh @sshArgs $remote $deployScript
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Deployment failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "Deployed successfully!" -ForegroundColor Green
}
