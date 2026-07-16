# Project Tracker — Demo Guide

**Project Tracker** is a Power Apps Code App (Vite + React 18 + TypeScript + Fluent UI v9) that gives a seller organization a live picture of **demo-asset coverage**: which customer demos are backed by reusable assets, where the gaps are, who the top contributors are — and, uniquely, **what it cost in AI to build the app itself**.

It runs today on a deterministic mock dataset (14 assets, 46 deliveries, a full usage graph) so the entire experience is clickable before a single Dataverse table is provisioned. The provisioning plan to make it live is already written (`dataverse/PROVISIONING.md`).

---

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Validation gates (all green):

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint --max-warnings 0
npm run test        # vitest
npm run build       # prebuild HashRouter check + vite build
```

---

## What's in the app

| Route | Page | What it shows |
|---|---|---|
| `/` | **Coverage Command Center** | Coverage dial, KPI stat cards, monthly trend, activity heatmap, per-solution-area coverage bars, top reused assets |
| `/deliveries` | **Deliveries** | Searchable/filterable table of demo deliveries; **Log a Demo** dialog (metadata-driven required fields) |
| `/assets` | **Asset Catalog** | Responsive card grid of demo assets with type/area/maturity badges, reuse counts, staleness |
| `/assets/:id` | **Asset Detail** | Asset metadata + every delivery that used it |
| `/gaps` | **Coverage Gaps** | Story-only deliveries grouped by gap reason |
| `/leaderboard` | **Leaderboard** | Top sellers by coverage; most-reused assets |
| `/build-cost` | **AI Build Cost** | The AIC dashboard (below) |

### Architecture highlights (talking points)

- **Three-layer**: components render → hooks orchestrate (`useCoverageAnalytics`) → services/providers expose contracts → generated services stay behind adapters. Swap the mock provider for the Dataverse provider with no page changes.
- **Metadata-backed form labels**: the Log-a-Demo dialog renders required-field asterisks from live Dataverse `RequiredLevel` metadata via the shared `DataverseFieldLabel` primitive — no hardcoded `*`.
- **Code-App-correct**: `HashRouter` (not BrowserRouter), port 3000, relative asset base for the Power Apps iframe, Fluent UI v9 only.

---

## The AIC dashboard — "what did the AI cost to build this?"

`/build-cost` is the wow feature. It surfaces the **actual AI Consumption (AIC)** spent building Project Tracker, captured with the reusable **`aic-tracker` skill** and rendered from `src/data/aicUsage.ts`.

Headline numbers (end-to-end, all 3 build sessions):

| Metric | Value |
|---|---|
| **Cost** | **$71.99** (cache-aware) |
| Premium credits | 350 (35 turns × Opus ×10) |
| Total tokens | ~19.8M (19.6M in / 210K out) |
| Active generation | 49m 16s |
| Wall-clock | 10h 19m |
| Model | claude-opus-4.8 |

**The insight that lands the demo:** a cache-blind estimate of the same work is **~$310**. Prompt caching (18.1M of 19.6M input tokens were cache reads billed at ~10% of list price) cut it to **$71.99 — roughly 77% lower**. The dashboard shows the cost donut (fresh / cache-read / cache-write / output), token composition, a per-model rate card, and a **running ledger** of cumulative cost at each checkpoint.

### How AIC is measured — the `aic-tracker` skill

Location: `~/.copilot/skills/aic-tracker/`

| File | Role |
|---|---|
| `SKILL.md` | Usage + when to invoke |
| `pricing.json` | Editable cache-aware rate card (per-1M list prices + Copilot credit multipliers) |
| `calc_aic.py` | Cache-aware calculator + running ledger (diffs cumulative snapshots so it never double-counts) |

**Running total, going forward** — at any checkpoint:

1. Query the Copilot session store for cumulative per-model usage (`usage_input_tokens`, `usage_output_tokens`, `usage_cache_read_tokens`, `usage_cache_write_tokens`, `usage_duration`, turn count).
2. Feed the cumulative snapshot to the calculator:

   ```bash
   echo '[{"model":"claude-opus-4.8","input_tokens":19631125,"output_tokens":210212,
     "cache_read_tokens":18069965,"cache_write_tokens":1520308,"turns":35}]' \
   | python ~/.copilot/skills/aic-tracker/calc_aic.py -i - \
       --label "my checkpoint" --dir <session>/files/aic \
       --start 2026-07-15T17:16:46Z --end 2026-07-16T03:35:48Z \
       --active-seconds 2956253 --json
   ```

3. It appends a row to `aic-ledger.csv`, updates `aic-state.json`, and prints the delta since the last checkpoint. Refresh `src/data/aicUsage.ts` from the JSON output and the dashboard tracks the new total.

`input_tokens` is the **total** prompt tokens and **includes** cache read + write; fresh input is derived as `input − cache_read − cache_write`. Rates in `pricing.json` are public list-price approximations — edit them to match your negotiated pricing.

---

## Making it live (handoff)

The prototype is backed by a mock provider. To connect real data:

1. Provision the schema per `dataverse/PROVISIONING.md` (3 tables — `dat_demodelivery`, `dat_demoasset`, `dat_demoassetusage` — 7 option sets, 5 relationships).
2. Register the data sources: `pac code add-data-source -a dataverse -t <table>` for each.
3. Point `createAppDataProvider()` at the Dataverse provider. Pages, hooks, and analytics are unchanged.

> The AIC dashboard is **build metadata**, not runtime data — it stays a static module (`src/data/aicUsage.ts`) fed by the skill ledger. It does not require Dataverse.
