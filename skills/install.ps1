# Installs the vendored Copilot skills into ~/.copilot/skills so Copilot can discover them.
# Usage:  ./skills/install.ps1
$ErrorActionPreference = 'Stop'
$src = $PSScriptRoot
$dest = Join-Path $HOME '.copilot\skills'
New-Item -ItemType Directory -Force -Path $dest | Out-Null

Get-ChildItem -Path $src -Directory | ForEach-Object {
    $target = Join-Path $dest $_.Name
    Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
    Write-Host "installed skill -> $target"
}
Write-Host "Done. Restart Copilot if it was already running so it picks up the skills."
