---
name: aic-tracker
description: "Track AIC (AI Consumption) for a coding session — tokens used, cache-aware cost in USD, premium-request credits, and wall-clock + active build time — and keep a running per-checkpoint ledger. Use when the user asks to measure the AI cost / credits / tokens / time to build something, wants a 'running total' of AI usage, or wants to export build-cost metrics into an app dashboard. Triggers: 'AIC', 'AI cost', 'how much did this cost', 'token usage', 'credits used', 'cost to build', 'running total of AI usage', 'build time', 'AI consumption dashboard'."
---

# /aic-tracker — AI Consumption Cost, Credits & Time

Measures what a coding session actually consumed and keeps a **running total** you
can watch climb across checkpoints. Reports four things:

1. **Tokens** — fresh input, cache-read, cache-write, and output (from real telemetry).
2. **Cost (USD)** — cache-aware, using editable list prices in `pricing.json`.
3. **Credits** — GitHub Copilot premium requests (user turns × per-model multiplier).
4. **Time** — wall-clock span and active model-generation time.

## Why cache-aware matters

Modern agent sessions are dominated by **prompt-cache reads**. A naive "input tokens ×
input rate" estimate can overstate cost 3–5×. `usage_input_tokens` is the TOTAL prompt
size and **includes** cache reads and writes:

```
fresh_input = input_tokens − cache_read_tokens − cache_write_tokens
```

Cache writes bill *above* the base input rate; cache reads bill *well below* it. This
skill prices each bucket separately.

## The data source

Token + time telemetry lives in the Copilot **session store** `events` table, reachable
via the agent's `session_store_sql` tool (DuckDB SQL). The relevant columns are:

- `usage_model`, `usage_input_tokens`, `usage_output_tokens`
- `usage_cache_read_tokens`, `usage_cache_write_tokens`
- `usage_duration` (active generation, **milliseconds**), `timestamp`, `type`

A standalone script cannot read this store — **the agent runs the query**, then pipes the
result into `calc_aic.py`.

## Workflow (run this each time the user wants an update)

### 1. Query the cumulative session totals per model

```sql
SELECT usage_model,
       SUM(COALESCE(usage_input_tokens,0))       AS in_tok,
       SUM(COALESCE(usage_output_tokens,0))      AS out_tok,
       SUM(COALESCE(usage_cache_read_tokens,0))  AS cache_read,
       SUM(COALESCE(usage_cache_write_tokens,0)) AS cache_write,
       SUM(COALESCE(usage_duration,0))           AS active_ms,
       MIN(timestamp) AS first_ts, MAX(timestamp) AS last_ts,
       COUNT(*) AS events
FROM events
WHERE timestamp > now() - INTERVAL '12 hours'   -- widen to cover the whole session
  AND usage_model IS NOT NULL
GROUP BY usage_model;
```

Get the turn count for credits:

```sql
SELECT COUNT(*) AS user_turns FROM events
WHERE timestamp > now() - INTERVAL '12 hours' AND type = 'user.message';
```

> Prefer filtering by `session_id` when you know it; otherwise a time window that spans
> the session is fine on a single-session machine.

### 2. Build a snapshot JSON (one object per model)

```json
[
  {"model": "claude-opus-4.8", "input_tokens": 18090764, "output_tokens": 193621,
   "cache_read_tokens": 16669100, "cache_write_tokens": 1388116, "turns": 18}
]
```

### 3. Run the calculator

```bash
python calc_aic.py -i snapshot.json \
  --label "phase 3 UI" \
  --dir "<session files dir>/aic" \
  --start 2026-07-15T18:53:39Z --end 2026-07-16T03:35:48Z \
  --active-seconds 2702318 --active-unit ms \
  --json
```

- `--dir` — where the running ledger lives. Use the session's `files/` folder so the
  ledger persists across checkpoints. The script writes `aic-ledger.csv` (one row per
  checkpoint, cumulative + delta) and `aic-state.json` (last snapshot, for delta calc).
- Re-running with the same `--dir` **appends** a checkpoint and shows "since last".
- `--no-write` for a dry run; `--reset` to start a fresh ledger.

### 4. Report to the user

Summarize cumulative cost, credits, tokens (with cache split), and build time, plus the
delta since the last checkpoint. Round money sensibly.

## Keeping a running total "going forward"

At each meaningful milestone (or whenever asked), repeat steps 1–4 with the **same
`--dir`**. Because the query returns cumulative session totals and the script diffs
against `aic-state.json`, every checkpoint shows both the session total and the increment
since the previous one. Never double-counts.

## Exporting to an app dashboard

To surface this inside an app (e.g. a Power Apps Code App "AI Build Cost" page), run the
calculator with `--json`, then write the emitted object into a committed data module the
app imports (e.g. `src/data/aicUsage.ts`). Refresh that file at each checkpoint so the
in-app dashboard tracks the running total. Include `per_model` so the dashboard can show
every model used.

## Pricing

`pricing.json` holds editable USD-per-1M-token rates and a `copilotMultiplier` per model.
**These are public list-price approximations — edit them to match your contract.** Model
keys match by longest prefix (`claude-opus-4.8` → `claude-opus`). Set `usdPerCredit` to a
number to also report a monetary credit-equivalent.

## Files

- `SKILL.md` — this file.
- `pricing.json` — editable rate card + credit multipliers.
- `calc_aic.py` — cache-aware calculator + ledger writer (no external deps; Python 3.9+).
- `data/` — created on first run per `--dir`; holds `aic-ledger.csv` + `aic-state.json`.

## Caveats

- Cost is an **estimate** from editable list prices, not an invoice.
- Credits model GitHub Copilot **premium requests** (turns × multiplier), which is distinct
  from token cost; both are shown.
- Wall-clock time includes idle gaps; **active generation** time (`usage_duration`) is the
  real compute time and is reported alongside.
