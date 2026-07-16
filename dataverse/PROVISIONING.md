# Provisioning Runbook — Project Tracker (Demo Asset Coverage)

This runbook executes the three provisioning plan artifacts in `dataverse/` to stand up the
**Project Tracker** Dataverse schema and bind it to the Code App. The plans are the re-runnable
source of truth; this file is the ordered driver.

| Plan file | Creates |
|---|---|
| `provision-tables.plan.json` | 7 global option sets, 3 custom tables, their columns |
| `provision-relationships.plan.json` | 5 lookup relationships (+ their lookup columns) |
| `register-datasources.plan.json` | `pac code add-data-source` bindings + typed SDK |

Publisher prefix: **`dat`** · Solution: **`<solution-name>`** · App: **Project Tracker**

---

## (a) HARD GATES — do not proceed until ALL are true

1. **Dataverse-skills plugin is installed.** Schema creation is owned by the plugin's
   `dv-solution` / `dv-metadata` skills.
   - GitHub Copilot: `/plugin install dataverse@awesome-copilot`
   - Claude Code: `/plugin install dataverse@claude-plugins-official`
   - Prereqs: `Python 3` + `pip install PowerPlatform-Dataverse-Client pandas`.
   - If it is not installed, **STOP** — do not fall back to hand-rolled Web API calls for this app.
2. **The environment is authenticated.** A valid PAC profile must point at the target environment:
   ```bash
   pac auth create --environment <environment-url>   # or: pac auth select --index <n>
   pac auth who                                       # confirm the ACTIVE environment
   ```
   The plugin resolves the target environment from the active PAC profile — verify it is the one you intend.
3. **The publisher prefix `dat` is confirmed.** `dat` is **immutable once data exists**
   (see `docs/adr/0001-publisher-prefix.md`). Confirm it matches `dataverse/planning-payload.json`
   before creating a single artifact. A wrong prefix cannot be changed after rows are written.
4. **The solution `<solution-name>` exists and is active.** Every `dv-metadata` call must carry the
   solution context so artifacts land in `<solution-name>` and NOT the Default Solution.

> ⚠️ **Destructive / irreversible:** steps 2–5 below mutate live Dataverse metadata. Run them
> against a **dev** environment first, never straight to production. Deleting or repurposing a
> published column/relationship after data exists requires an additive migration, not an edit.

---

## (a.1) Fallback path — Dataverse-skills plugin NOT installed

**Current environment status (2026-07):** the `dv-metadata` / `dv-solution` plugin is **not
installed** here, so the plugin-driven steps in section (b) cannot run as written. Rather than
hand-roll Web API calls per-request, this repo now ships a reusable fallback skill that drives the
`PowerPlatform-Dataverse-Client` SDK from the same `planning-payload.json`:

- Skill: **`dataverse-provision`** (`~/.copilot/skills/dataverse-provision/`)
- Validate the plan with **zero auth / zero mutation**:
  ```bash
  python ~/.copilot/skills/dataverse-provision/provision.py --dry-run
  ```
- Apply it (needs a human once, for sign-in):
  ```bash
  python ~/.copilot/skills/dataverse-provision/provision.py \
    --url https://org8599b1c0.crm.dynamics.com \
    --auth devicecode --tenant <tenant-guid-or-domain> \
    --solution <solution-name> --yes
  ```

The skill creates **local** option sets (from the payload's global defs), plain columns in place of
rollups, and all 5 lookups. See the skill's `SKILL.md` for the exact simplification table. If you
later install the Dataverse-skills plugin, prefer section (b) instead (native global option sets +
rollups).

### 🚦 Blockers before the live run

1. **Publisher-prefix conflict — ✅ RESOLVED (keep `dat`).** The setup wizard had written
   `contoso` to `.env`, but the planning payload + ADR-0001 use **`dat`**, which is hard-coded
   across `src/lib/optionSets.ts`, the generated types, and `planning-payload.json`. Keeping `dat`
   is the zero-churn choice, so `.env` (`PP_PUBLISHER_PREFIX`) and `README.md` were updated to
   `dat`. **Action still required at run time:** ensure a publisher with prefix `dat` exists in the
   target environment (create it via the Maker portal or `dv-solution`), then run the provisioner
   with the default prefix.
2. **Interactive sign-in — ⛔ still required.** The target org `org8599b1c0.crm.dynamics.com` is in
   tenant `M365x61645866`; the local `az` context is a different tenant, so non-interactive auth is
   unavailable. `--auth devicecode` needs a human to enter a code once. Run it when the owner is
   present, or register an App Registration as an Application User and use `--auth env`.

---

---

## (b) Ordered execution steps

Run in this exact order — the golden sequence fails if reversed.

### 1. Confirm the solution — `dv-solution`
Confirm (or create) `<solution-name>` under publisher prefix `dat`, and pin it for the session so
every subsequent `dv-metadata` call inherits the solution context.

### 2. Create option sets + tables + columns — `dv-metadata` (from `provision-tables.plan.json`)
Walk the plan in order:
1. Create the **7 global option sets** (`optionSets[]`) — global, never inline; values start at `100000000`.
2. Create the **3 tables** (`tables[]`, in `order` 1→3) with their primary name column and ownership
   (`dat_demodelivery` = UserOwned, `dat_demoasset` = OrganizationOwned, `dat_demoassetusage` = UserOwned).
3. Create each table's **simple columns** (String/Memo/Integer/DateTime).
4. Create each table's **picklist columns**, binding to the global option set via
   `GlobalOptionSet@odata.bind` (`globalOptionSetName`).
   - `account` and `systemuser` are **reused OOB** (`reuseOOB[]`) — do not create custom tables for them;
     add them to the solution via `pac solution add-reference` if not already present.

### 3. Create relationships — `dv-metadata` (from `provision-relationships.plan.json`)
Create the **5 ManyToOne lookups** in `order` 1→5. Each creates its lookup column on the referencing
table, so all tables must already exist (step 2). Apply the stated `cascadeConfiguration`
(Referential / Cascade / Restrict). The rollup columns recalculate once these relationships exist.

### 4. Publish — PublishAllXml
Publish **all** customizations. Until this runs, the new tables/columns/relationships exist in metadata
but are invisible to the runtime, OData, and `pac code add-data-source` (the #1 cause of
"table/column not found").

### 5. Register data sources — `pac code add-data-source` (from `register-datasources.plan.json`)
Run the 6 entries in `order` 1→6 (prefer the `/add-dataverse` and `/add-office365` skills):
- Custom + OOB Dataverse tables (`requiresLiveConnectionId: false`) — no connection ID needed.
- **Office 365 Users** (`requiresLiveConnectionId: true`) — first discover the connection ID with
  `pac connection list` (filter `shared_office365users`) or `/list-connections`, then substitute for
  `<CONN_OFFICE365USERS>`.

Each command updates `power.config.json` and regenerates typed files under `src/generated/**`.

---

## (c) After registration — no seed step; flip to live data

- **No `npm run prototype:seed`-equivalent is required.** The typed data contracts are already generated;
  registration in step 5 only refreshes `src/generated/**` to match the live schema.
- **Switch the app from mock to live data** by setting the environment flag:
  ```
  VITE_USE_MOCK=false
  ```
  in your `.env` (or environment), then rebuild/restart. This tells the app to use the live Dataverse
  data sources instead of the mock providers used during prototype validation.

---

## Validation steps

- `pac auth who` shows the intended environment before you start.
- After step 2: the 3 tables and 7 choices appear in `<solution-name>`'s component list.
- After step 3: each lookup column (`dat_customer`, `dat_presenter`, `dat_maintainer`,
  `dat_demodelivery`, `dat_demoasset`) is present on the referencing table.
- After step 4: the tables/columns resolve over OData (`GET {env}/api/data/v9.2/dat_demodeliveries?$top=1`).
- After step 5: `power.config.json` lists the 5 Dataverse databaseReferences + the Office 365 Users
  connectionReference, and `src/generated/**` contains a service + model per entity.
- With `VITE_USE_MOCK=false`, the running app reads/writes real rows.

## Rollback / cleanup notes

- Metadata changes are **not transactional**. If a step fails midway, fix the plan and re-run — the
  `dv-metadata` skill is idempotent and skips artifacts that already exist.
- To fully unwind in a **dev** environment before any data exists: delete the relationships first, then
  the columns, then the tables, then the global option sets (reverse of creation order). Deleting an OOB
  table reference (`account`, `systemuser`) only removes the solution reference, never the OOB table.
- **Never** delete/repurpose a published column or relationship once production data exists — plan an
  additive migration instead.
- To undo a data-source binding, run `pac code delete-data-source` for that entry (removes it from
  `power.config.json` and `src/generated/**`); the underlying Dataverse table is unaffected.

## Files to update / produced

- `dataverse/provision-tables.plan.json` — reviewed & executed (input)
- `dataverse/provision-relationships.plan.json` — reviewed & executed (input)
- `dataverse/register-datasources.plan.json` — reviewed & executed (input)
- `power.config.json` — updated by step 5 (database/connection references)
- `src/generated/**` — regenerated by step 5
- `.env` — set `VITE_USE_MOCK=false` (and confirm `PP_PUBLISHER_PREFIX=dat`)
