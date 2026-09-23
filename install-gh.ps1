Write-Output "=== gh check ==="
$gh = Get-Command gh -ErrorAction SilentlyContinue
if ($gh) { gh --version } else { Write-Output "gh not found" }
Write-Output "=== winget install gh ==="
winget install --id GitHub.cli --accept-source-agreements --accept-package-agreements
Write-Output "=== install attempt finished ==="
