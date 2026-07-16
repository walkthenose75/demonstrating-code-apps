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
2. The Code App's environment already created (`pac code init` done) and a
   **publisher whose prefix matches `publisher.prefix` in the payload** exists in
   the target environment. If the environment's publisher prefix differs from the
   payload (common when the setup wizard chose a different prefix), decide which
   wins **before** running — either pass `--prefix <envPrefix>` or create the
   payload's publisher. The prefix is immutable once data exists.
3. Auth: an identity that is an admin / customizer in the target environment.

## Usage

```bash
# 1) Validate the plan — no auth, no mutation. Always do this first.
python provision.py --dry-run

# 2) Live run with device-code sign-in (headless-friendly; needs a human once).
python provision.py \
  --url https://org.crm.dynamics.com \
  --auth devicecode --tenant contoso.onmicrosoft.com \
  --solution MySolutionUniqueName --yes

# Alternatives:
#   --auth azurecli   use current `az login` (must be the TARGET tenant)
#   --auth env        ClientSecretCredential from AZURE_TENANT_ID/CLIENT_ID/CLIENT_SECRET
#   --prefix contoso  override the payload publisher prefix
```

Arguments: `--payload` (default `dataverse/planning-payload.json`), `--url`
(default `$PP_ENV_DEV`), `--solution`, `--prefix`, `--auth {devicecode,azurecli,env}`,
`--tenant`, `--dry-run`, `--yes`.

## What it does

1. Loads the payload; turns each **global option set** into a **local** `IntEnum`
   applied per column.
2. For each table: creates it (primary + primitive + choice columns) if missing,
   or adds only missing columns if it already exists (idempotent).
3. After all tables exist, creates the **lookup** columns / relationships
   (`create_lookup_field`) — including lookups to OOB tables (`account`,
   `systemuser`) — skipping any that already exist.
4. Prints a summary and the follow-up `pac code add-data-source` commands.

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
pac code add-data-source -a dataverse -t dat_demodelivery
pac code add-data-source -a dataverse -t dat_demoasset
pac code add-data-source -a dataverse -t dat_demoassetusage
```

Then swap the app's data provider from mock to Dataverse, `npm run build`, and
`pac code push`.
