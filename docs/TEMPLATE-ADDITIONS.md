# What This Template Adds

This repo started from the base **Microsoft PowerAppsCodeApps** Vite template
(`microsoft/PowerAppsCodeApps/templates/vite`) and grew into a **reusable, agent-driven
Power Apps Code App starter**. This file inventories everything layered on top of the base
template so a fork owner knows what they are inheriting.

> **Fork base:** `microsoft/PowerAppsCodeApps/templates/vite`
> **This template:** a planning-first, agent-orchestrated Code App with an AI-build-cost
> dashboard and Dataverse provisioning fallback.

---

## 1. Specialist agents (`.github/agents/`)

Nine custom agents that the **PowerApps CodeApps Orchestrator** routes work to. They travel
with a fork automatically (they live in the repo).

| Agent | Role |
|-------|------|
| `powerapps-codeapps-orchestrator` | Coordinates the build; routes to specialists; enforces the instruction flow |
| `solution-architect` | Overall architecture, folder structure, data boundaries, plan |
| `dataverse-engineer` | Schema, relationships, service patterns, TS models, data access |
| `react-ui-engineer` | Accessible, responsive React + Fluent UI v9 |
| `power-platform-alm-engineer` | PAC CLI, env setup, solution packaging, deploy, release |
| `copilot-agent-integration-engineer` | Copilot Studio / M365 Copilot / connector / API integration |
| `qa-security-reviewer` | Code, config, Dataverse, security, testing, release readiness |
| `documentation-engineer` | README, setup guides, ADRs, prompt library, publishing docs |
| `github-repo-maintainer` | Repo structure, issues, PR readiness, changelog, OSS hygiene |

## 2. Instruction set (`.github/instructions/`)

21 path-scoped instruction files codifying the **plan-first → prototype-second → connect-later**
delivery sequence, plus the **grilling cadence**, form-field pattern, org-structure/security,
and publishing flow. Key additions beyond a stock template:

- `00a–00e` — business decomposition, scope shaping, solution→Dataverse plan, prototype
  validation, and the **grill-and-document** interview cadence (`CONTEXT.md` + ADRs).
- `07a` / `07b` — existing-schema discovery (OOB-first) and org-structure/security.
- `09` — the `DataverseFieldLabel` metadata-backed form-field pattern.
- `10` — publishing flow for the shipped instruction package.

## 3. Vendored skills (`skills/`)

Two custom Copilot skills, vendored so they travel with a fork (see [`skills/README.md`](../skills/README.md)):

- **`aic-tracker`** — cache-aware AI Consumption ledger (tokens / USD / credits / time).
- **`dataverse-provision`** — payload-driven Dataverse provisioner (SDK), the plugin fallback.

Install into a fresh clone with `./skills/install.ps1` (or `.sh`).

## 4. The reference application (`src/`)

A complete, mock-backed **Demo Asset Coverage** app demonstrating the full pattern:

- **Three-layer architecture** — components render, hooks orchestrate, services/providers expose
  contracts; a swappable mock/Dataverse data provider (`src/services/providerFactory.ts`).
- **7 routes** under a Fluent `AppShell` (Workspace + Insights nav sections), `HashRouter`.
- **AI Build Cost dashboard** (`src/pages/BuildCostPage.tsx`) fed by `src/data/aicUsage.ts`,
  the canonical output of the `aic-tracker` skill.
- Form-field metadata pattern scaffolding (`src/services/fieldMetadata.ts`,
  `src/lib/`, `useDataverseFieldMetadata`).

## 5. Planning + provisioning artifacts (`dataverse/`, `docs/`)

- `dataverse/planning-payload.json` — the re-runnable schema source of truth (3 tables,
  7 option sets, 5 lookups, org structure).
- `dataverse/PROVISIONING.md` + `*.plan.json` — the ordered provisioning runbook, including the
  **plugin-free fallback** (§a.1) driving the `dataverse-provision` skill.
- `docs/adr/` — architecture decision records (e.g. publisher prefix `dat`, flat org structure).
- `docs/DEMO-GUIDE.md` — the demo walkthrough.
- `CONTEXT.md` — the project business glossary.

## 6. Config decisions baked in

| Decision | Value | Where |
|----------|-------|-------|
| Publisher prefix | `dat` (immutable) | `.env`, `README.md`, ADR-0001, `planning-payload.json` |
| Router | `HashRouter` (Power Apps iframe requirement) | `src/main.tsx` |
| Local dev port | 3000 (SDK requirement) | `vite.config.ts` |
| Prod asset base | `./` (relative, for iframe) | `vite.config.ts` |
| UI system | Fluent UI v9 only | throughout |

---

See [`TEMPLATE-HANDOFF.md`](./TEMPLATE-HANDOFF.md) for how to fork this and start a new app from it.
