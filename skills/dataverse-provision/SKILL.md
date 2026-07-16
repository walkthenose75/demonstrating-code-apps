---
name: dataverse-provision
description: >-
  Provision a Dataverse schema (publisher-prefixed tables, columns, local option
  sets, and lookup relationships) directly from a PACAF `dataverse/planning-payload.json`
  using the bundled PowerPlatform-Dataverse-Client SDK. Use this when the
  Dataverse-skills plugin is NOT installed but you still need to stand up the
  schema for a Power Apps Code App. Idempotent; supports `--dry-run` (no auth, no
  mutation) to validate the plan first. Triggers: "provision the Dataverse
  schema", "create the tables from the planning payload", "go live with
  Dataverse", "the Dataverse plugin isn't installed but I need the schema".
---

# dataverse-provision

Fills the gap left when the **Dataverse-skills plugin** is unavailable. Reads the
PACAF planning artifact and creates the schema directly via the
`PowerPlatform-Dataverse-Client` Python SDK (installed with
`pip install PowerPlatform-Dataverse-Client pandas`).

## When to use

- You have a `dataverse/planning-payload.json` (produced by the 00c planning flow).
- The Dataverse-skills plugin (`dv-metadata`) is not installed / its MCP tools
  are unreachable, and you cannot install it right now.
- You want a repeatable, idempotent, source-controlled provisioning step.

If the Dataverse-skills plugin **is** installed, prefer it (`dv-metadata`) — it
supports global option sets and rollups natively. Use this skill as the fallback.

## Prerequisites

1. `pip install PowerPlatform-Dataverse-Client pandas azure-identity`
2. The Code App's environment already created (`pac code init` done).
3. A **publisher whose prefix matches `publisher.prefix` in the payload** in the
   target environment. **You no longer have to create it by hand** — pass
   `--ensure-solution` and the skill creates the publisher (by prefix) **and** the
   solution if they don't already exist, then reuses them on re-runs. If a
   publisher with a *different* prefix already owns your data, decide which wins
   **before** running (`--prefix <envPrefix>`); the prefix is immutable once data
   exists.
4. Auth: an identity that is an admin / customizer in the target environment.

## Usage

```bash
# 1) Validate the plan — no auth, no mutation. Always do this first.
python provision.py --dry-run

# 2a) LOW-FRICTION DEFAULT — Service Principal (headless, no prompts, CI-safe).
#     Set AZURE_TENANT_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET in .env first
#     (the App Registration must be an Application User in the environment).
python provision.py \
  --url https://org.crm.dynamics.com \
  --auth env \
  --ensure-solution --solution ProjectTracker --yes

# 2b) FALLBACK — device-code sign-in (no SPN needed; one interactive sign-in).
#     The verification URL + code are printed AND written to
#     dataverse/.devicecode.txt; an AuthenticationRecord is saved to
#     dataverse/.authrecord.json so subsequent runs reuse the token silently.
#     ⚠ Complete the sign-in PROMPTLY — device codes expire in a couple of minutes.
python provision.py \
  --url https://org.crm.dynamics.com \
  --auth devicecode --tenant contoso.onmicrosoft.com \
  --ensure-solution --solution ProjectTracker --yes

# Other auth:
#   --auth azurecli   use current `az login` (MUST be the TARGET tenant)
#   --prefix contoso  override the payload publisher prefix
```

Arguments: `--payload` (default `dataverse/planning-payload.json`), `--url`
(default `$PP_ENV_DEV`), `--solution`, `--prefix`,
`--auth {devicecode,azurecli,env}`, `--tenant`, `--ensure-solution`,
`--publisher-name`, `--publisher-friendly`, `--option-value-prefix`,
`--dry-run`, `--yes`.

### Auth is resilient by design

- **Device-code**: prompt is flushed to stdout **and** a file, and the
  `AuthenticationRecord` is persisted (`dataverse/.authrecord.json`) so only the
  first run needs interactive sign-in. Both files are git-ignored (token material).
- **Transient metadata conflicts**: Dataverse metadata ops are async; a
  just-created table can still be "customizing" when the next relationship starts
  (`Cannot start another EntityCustomization`). Lookup creation retries these with
  backoff automatically.
- **Idempotent**: existing tables/columns/lookups are detected and skipped, so the
  command is safe to re-run after any partial failure.

## What it does

1. (with `--ensure-solution`) Ensures the **publisher** (by prefix) and
   **solution** exist, creating them if missing and reusing them otherwise.
2. Loads the payload; turns each **global option set** into a **local** `IntEnum`
   applied per column.
3. For each table: creates it (primary + primitive + choice columns) if missing,
   or adds only missing columns if it already exists (idempotent).
4. After all tables exist, creates the **lookup** columns / relationships
   (`create_lookup_field`) — including lookups to OOB tables (`account`,
   `systemuser`) — skipping any that already exist and retrying transient
   metadata-concurrency errors with backoff.
5. Prints a summary and the follow-up `pac code add-data-source` commands.

## Known simplifications (all printed in the plan, never silent)

| Payload construct | This skill creates | Why it's fine |
|---|---|---|
| Global option set | **Local** option set per column (same values/labels) | App's `src/lib/optionSets.ts` hard-codes values → identical at runtime |
| Rollup column | Plain Integer / DateTime column | App derives coverage/reuse client-side from usage records |
| `maxLength` / `format` (Url, DateOnly, Money) | SDK default type | Cosmetic; not enforced by the demo |

If you need **true global** option sets or **rollup** columns, use the
Dataverse-skills plugin instead, or extend `provision.py` with raw Web API calls
to `GlobalOptionSetDefinitions` / a rollup `RollupType` definition.

## After provisioning

```bash
# Register each table as a Code App data source (regenerates src/generated/)
pac code add-data-source -a dataverse -t pt_project
pac code add-data-source -a dataverse -t pt_resource
pac code add-data-source -a dataverse -t pt_assignment
```

Then swap the app's data provider from mock to Dataverse, `npm run build`, and
`pac code push`.
