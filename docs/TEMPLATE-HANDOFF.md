# Template Handoff Guide

How to take this repo and start a **new** Power Apps Code App from it. This is the fork-and-reuse
path for teammates. Read [`TEMPLATE-ADDITIONS.md`](./TEMPLATE-ADDITIONS.md) first to know what
you're inheriting.

---

## 1. Fork / clone

```bash
# Fork on GitHub, then:
git clone https://github.com/<you>/<your-fork>.git
cd <your-fork>
npm install
```

## 2. Install the vendored skills

```powershell
./skills/install.ps1     # Windows
```
```bash
./skills/install.sh      # macOS / Linux
```

This puts `aic-tracker` and `dataverse-provision` into `~/.copilot/skills/`. Restart Copilot so it
discovers them.

## 3. Prerequisites

Run the prereq gate (see `.github/instructions/00-prereq-gate.instructions.md`). You need:
Node.js, .NET SDK, PAC CLI, Git, Python 3. For Dataverse work also:
`pip install PowerPlatform-Dataverse-Client pandas azure-identity`.

## 4. Point at your own environment

Edit `.env` and `power.config.json`:

- `PP_ENV_DEV` / `PP_ENV_TEST` / `PP_ENV_PROD` — your environment URLs.
- `PP_PUBLISHER_PREFIX` — **choose your own 2–8 char prefix** (this template uses `pt`). It is
  **immutable once data exists** — decide deliberately and record it in `docs/adr/`.
- `power.config.json` — `appId` / `environmentId` are set on first `pac code init` / `pac code push`.

> If you keep the reference app, a global find/replace of `pt_` → `<yourprefix>_` across
> `src/lib/dataverse-field-name.ts`, `dataverse/planning-payload.json`, and generated types is required.
> Easier for a brand-new app: delete the reference pages and start the planning flow fresh.

## 5. Plan first (the whole point of this template)

Start the orchestrator and walk the planning cadence — do **not** jump to schema:

1. `00a` business decomposition → `00b` scope shaping → `00c` solution→Dataverse plan.
2. The **grilling cadence** (`00e`) drives one-question-at-a-time interviews, builds `CONTEXT.md`,
   and records ADRs.
3. Output: a new `dataverse/planning-payload.json`.

## 6. Prototype with mock data

The reference app already wires a swappable provider (`src/services/providerFactory.ts`). Build
your pages against the mock provider, validate the UX, then flip to Dataverse.

## 7. Provision Dataverse

**If the Dataverse-skills plugin is installed:** follow `dataverse/PROVISIONING.md` §(b).

**If not:** use the fallback skill:
```bash
python skills/dataverse-provision/provision.py --dry-run           # validate, no auth
python skills/dataverse-provision/provision.py --url <org-url> \
  --auth devicecode --tenant <tenant> --solution <name> --yes      # apply
```

Then register data sources and regenerate `src/generated/`:
```bash
pac code add-data-source -a dataverse -t <tableLogicalName>
```

## 8. Track the AI build cost (optional, high wow-factor)

At each milestone, snapshot usage and append a ledger checkpoint:
```bash
python ~/.copilot/skills/aic-tracker/calc_aic.py -i snapshot.json \
  --dir <ledger-dir> --label "checkpoint: <what>" --start <iso> --end <iso> --active-seconds <s>
```
Copy the totals into `src/data/aicUsage.ts` and the **AI Build Cost** dashboard updates itself.

## 9. Build + deploy

```bash
npm run build
pac code push
```

---

## Fork hygiene

- Keep `skills/` as the source of truth for the two custom skills; copy improvements back from
  `~/.copilot/skills/` before committing.
- Update `docs/adr/` when you make a hard-to-reverse decision (prefix, solution split, data store).
- The `.github/instructions/**` files are a shipped artifact — if you change them, follow
  `.github/instructions/10-publishing.instructions.md`.
