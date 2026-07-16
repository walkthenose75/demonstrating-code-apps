# Project Tracker

A Power Apps Code App built with React, Fluent UI v9, TanStack Query, and TypeScript.

## Development

```bash
npm install
npm run dev:local
npm run prototype:seed
npm run dev
```

## Build and Deploy

```bash
npm run build
pac code push
```

## Power Platform

| Property | Value |
|----------|-------|
| Solution | x_Project Tracker |
| Publisher Prefix | `dat` |

| Environment | URL |
|-------------|-----|
| Dev | https://org8599b1c0.crm.dynamics.com |
| Test | https://org0e6401b6.crm.dynamics.com |
| Prod | https://org04243e64.crm.dynamics.com |

Connector binding is intentionally deferred until the prototype is stable. Use WizardUX step 9 or `pac code add-data-source` when you are ready for real data.

## Using This as a Template

This repo is a **reusable, agent-driven Power Apps Code App starter** — not just one app. If you
are here to build your own app from it:

- [`docs/TEMPLATE-ADDITIONS.md`](docs/TEMPLATE-ADDITIONS.md) — everything layered on top of the
  base Microsoft PowerAppsCodeApps Vite template (9 specialist agents, 21 instruction files,
  2 vendored skills, the reference app, planning + provisioning artifacts).
- [`docs/TEMPLATE-HANDOFF.md`](docs/TEMPLATE-HANDOFF.md) — step-by-step fork-and-reuse guide.
- [`skills/README.md`](skills/README.md) — the vendored `aic-tracker` and `dataverse-provision`
  Copilot skills and how to install them (`./skills/install.ps1` or `.sh`).
- [`docs/DEMO-GUIDE.md`](docs/DEMO-GUIDE.md) — walkthrough of the reference app + AI Build Cost
  dashboard.

Planning is deliberately first-class: start with `.github/instructions/00a`–`00e` and let the
**PowerApps CodeApps Orchestrator** route work to the specialist agents.
