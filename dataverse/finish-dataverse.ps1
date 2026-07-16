<#
  finish-dataverse.ps1 — one command, ONE sign-in to complete the Dataverse go-live.

  What it does (both steps share a single cached token, so you sign in once):
    1. Provisions the 5 lookup relationships (pt_client, pt_projectlead,
       pt_owner, pt_project, pt_resource) into the ProjectTracker solution.
    2. Seeds rich sample data (accounts -> resources -> projects -> assignments).

  Usage (run from the repo root, while you are at the machine so the browser
  sign-in can complete):

    pwsh -File dataverse/finish-dataverse.ps1

  Sign in as your Contoso-Dev admin (admin@M365x61645866.onmicrosoft.com) in the
  browser window that opens. After the first sign-in the token is cached, so the
  seed step runs silently.

  Both steps are idempotent — re-running only creates what is missing. Add
  -Force to reseed data.
#>
[CmdletBinding()]
param(
  [string]$Url    = "https://org8599b1c0.crm.dynamics.com",
  [string]$Tenant = "211793ba-f563-4e53-9d36-f7ce619eda41",
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Resolve-Python {
  foreach ($c in @("py", "python", "python3")) {
    try { & $c --version *> $null; if ($LASTEXITCODE -eq 0) { return $c } } catch {}
  }
  throw "Python 3 not found. Install it, then re-run."
}
$py = Resolve-Python
$pyArgs = @()
if ($py -eq "py") { $pyArgs += "-3" }

Write-Host "==> Step 1/2: provisioning lookups (browser sign-in) ..." -ForegroundColor Cyan
& $py @pyArgs "skills/dataverse-provision/provision.py" `
  --url $Url --auth interactive --tenant $Tenant `
  --ensure-solution --solution ProjectTracker --yes
if ($LASTEXITCODE -ne 0) { throw "Provisioning failed (exit $LASTEXITCODE). Fix the error above and re-run." }

Write-Host "==> Step 2/2: seeding sample data (reusing cached sign-in) ..." -ForegroundColor Cyan
$seedArgs = @("dataverse/seed.py", "--url", $Url, "--tenant", $Tenant, "--auth", "interactive")
if ($Force) { $seedArgs += "--force" }
& $py @pyArgs @seedArgs
if ($LASTEXITCODE -ne 0) { throw "Seeding failed (exit $LASTEXITCODE). Fix the error above and re-run." }

Write-Host ""
Write-Host "Done. Lookups provisioned and sample data seeded in Contoso-Dev." -ForegroundColor Green
Write-Host "Next (optional, to flip the app UI to live Dataverse):" -ForegroundColor Yellow
Write-Host "  pac code add-data-source -a dataverse -t pt_project" -ForegroundColor Yellow
Write-Host "  pac code add-data-source -a dataverse -t pt_resource" -ForegroundColor Yellow
Write-Host "  pac code add-data-source -a dataverse -t pt_assignment" -ForegroundColor Yellow
Write-Host "  `$env:VITE_USE_MOCK='false'; npm run build; pac code push" -ForegroundColor Yellow
Write-Host "  (validate rendering in the play URL before the demo; keep mock as instant rollback)" -ForegroundColor Yellow
