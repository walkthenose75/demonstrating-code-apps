# Vendored Copilot Skills

These skills are **vendored into the repo** (rather than living only in your personal
`~/.copilot/skills/`) so they **travel with a fork**. Anyone who clones this template gets
them, and can install them into their own Copilot with one command.

| Skill | What it does |
|-------|--------------|
| [`aic-tracker`](./aic-tracker) | Measures **AIC** (AI Consumption) for a build session — tokens, cache-aware USD cost, GitHub Copilot premium-request credits, wall + active time — and keeps a running per-checkpoint ledger. Powers the in-app **AI Build Cost** dashboard. |
| [`dataverse-provision`](./dataverse-provision) | Provisions a Dataverse schema (tables, columns, local option sets, lookups) directly from `dataverse/planning-payload.json` via the `PowerPlatform-Dataverse-Client` SDK. The fallback for when the Dataverse-skills plugin is not installed. Supports `--dry-run` (no auth). |

## Install into your Copilot

Copilot discovers skills under `~/.copilot/skills/`. Copy the vendored copies there:

**Windows (PowerShell):**
```powershell
./skills/install.ps1
```

**macOS / Linux (bash):**
```bash
./skills/install.sh
```

Each script copies every folder here into `~/.copilot/skills/` (creating it if needed) and
prints what it installed. Re-run any time you pull updates.

## Prerequisites

- `aic-tracker` — Python 3 (uses only the stdlib).
- `dataverse-provision` — Python 3 + `pip install PowerPlatform-Dataverse-Client pandas azure-identity`.

## Editing convention

The repo copy under `skills/` is the **source of truth** for a fork. If you improve a skill in
`~/.copilot/skills/`, copy it back here before committing so the fork stays current.
