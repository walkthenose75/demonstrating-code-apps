#!/usr/bin/env python3
"""dataverse-provision — provision a Dataverse schema from a PACAF planning payload.

Fills the gap left when the Dataverse-skills plugin is not installed: it reads a
`dataverse/planning-payload.json` (the PACAF planning artifact) and creates the
publisher-prefixed tables, columns, (local) option sets, and lookup
relationships directly via the bundled PowerPlatform-Dataverse-Client SDK.

It is idempotent (skips tables/columns/lookups that already exist) and supports a
`--dry-run` that prints the full plan without connecting or mutating anything.

Known simplifications vs. a full plugin/Web-API provisioning (all logged in the
plan output so nothing is silent):
  * Global option sets in the payload are created as LOCAL option sets on each
    column (same values/labels). The app's optionSets.ts uses hard-coded values,
    so this is functionally equivalent.
  * Rollup columns are created as plain Integer/DateTime columns (the app derives
    coverage/reuse client-side from usage records).
  * Column maxLength / format (Url, DateOnly, Money precision) are not set via the
    SDK's simple-type DSL — defaults are used.

Auth modes (choose with --auth):
  devicecode  Print a code + URL; sign in in any browser (headless-friendly).
              Requires --tenant (GUID or verified domain).
  azurecli    Use the current `az login` context (must be the target tenant).
  env         ClientSecretCredential from AZURE_TENANT_ID / AZURE_CLIENT_ID /
              AZURE_CLIENT_SECRET (an App Registration registered as an
              Application User in the target environment).

Usage:
  python provision.py --dry-run
  python provision.py --url https://org.crm.dynamics.com --auth devicecode \
      --tenant contoso.onmicrosoft.com --solution DemoAssetTracker --yes
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from enum import IntEnum
from typing import Any


# ── payload → SDK type mapping ────────────────────────────────────────────────
# Lookups are handled separately (create_lookup_field), Picklists become IntEnums.
SIMPLE_TYPE = {
    "String": "string",
    "Memo": "memo",
    "Integer": "int",
    "Decimal": "decimal",
    "Money": "money",
    "Double": "float",
    "DateTime": "datetime",
    "Boolean": "bool",
}

CASCADE = {
    "Cascade": "Cascade",
    "Referential": "RemoveLink",
    "Restrict": "Restrict",
    "RemoveLink": "RemoveLink",
}


def log(msg: str = "") -> None:
    print(msg, flush=True)


def enum_member(label: str, value: int) -> str:
    name = re.sub(r"[^A-Za-z0-9]+", "_", label).strip("_").upper()
    if not name or name[0].isdigit():
        name = f"OPT_{name}"
    return name


def build_option_enums(payload: dict[str, Any]) -> dict[str, type[IntEnum]]:
    """Turn each global option set definition into a local IntEnum class."""
    enums: dict[str, type[IntEnum]] = {}
    for os_def in payload.get("globalOptionSets", []):
        members: dict[str, int] = {}
        used: set[str] = set()
        for opt in os_def["options"]:
            m = enum_member(opt["label"], opt["value"])
            while m in used:
                m = f"{m}_{opt['value']}"
            used.add(m)
            members[m] = opt["value"]
        enums[os_def["name"]] = IntEnum(os_def["name"], members)
    return enums


def plan_table(table: dict[str, Any], enums: dict[str, type[IntEnum]]):
    """Return (create_columns, lookup_specs) for a table definition."""
    create_cols: dict[str, Any] = {}
    lookups: list[dict[str, Any]] = []
    for c in table["columns"]:
        ctype = c["type"]
        if ctype == "Lookup":
            lookups.append({
                "field": c["schemaName"],
                "target": c["targetTable"],
                "display": c["displayName"],
                "required": c.get("requiredLevel") == "ApplicationRequired",
            })
        elif ctype == "Picklist":
            os_name = c.get("globalOptionSetName")
            enum_cls = enums.get(os_name)
            if enum_cls is None:
                raise ValueError(f"Option set '{os_name}' not found for column {c['schemaName']}")
            create_cols[c["schemaName"]] = enum_cls
        else:
            sdk_type = SIMPLE_TYPE.get(ctype)
            if sdk_type is None:
                raise ValueError(f"Unsupported column type '{ctype}' on {c['schemaName']}")
            create_cols[c["schemaName"]] = sdk_type
    return create_cols, lookups


def resolve_target(target: str, tables_by_logical: dict[str, str]) -> str:
    """Map a payload targetTable (entity set / logical) to the table logical name."""
    return tables_by_logical.get(target, target)


def load_payload(path: str) -> dict[str, Any]:
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def make_credential(args):
    from azure.identity import (  # noqa: WPS433 (lazy import so --dry-run needs no auth)
        AzureCliCredential,
        ClientSecretCredential,
        DeviceCodeCredential,
    )
    # Azure CLI public client id — works for device-code against Dataverse.
    AZ_CLI_CLIENT = "04b07795-8ddb-461a-bbee-02f9e1bf7b46"
    if args.auth == "azurecli":
        return AzureCliCredential()
    if args.auth == "env":
        return ClientSecretCredential(
            tenant_id=os.environ["AZURE_TENANT_ID"],
            client_id=os.environ["AZURE_CLIENT_ID"],
            client_secret=os.environ["AZURE_CLIENT_SECRET"],
        )
    if not args.tenant:
        sys.exit("ERROR: --auth devicecode requires --tenant (GUID or verified domain).")

    def _prompt(verification_uri: str, user_code: str, expires_on) -> None:
        msg = f"\n>>> DEVICE CODE: open {verification_uri} and enter code:  {user_code}\n"
        print(msg, flush=True)
        # Also write to a file so a headless/piped caller can surface the code
        # even if stdout is buffered.
        try:
            code_file = os.environ.get("DVP_DEVICE_CODE_FILE", "dataverse/.devicecode.txt")
            with open(code_file, "w", encoding="utf-8") as fh:
                fh.write(f"{verification_uri}\n{user_code}\n")
        except OSError:
            pass

    # Enable a persistent token cache + saved AuthenticationRecord so the
    # interactive sign-in survives across process runs (subsequent provisioning
    # commands reuse the token silently instead of re-prompting a device code).
    rec_path = os.environ.get("DVP_AUTH_RECORD_FILE", "dataverse/.authrecord.json")
    try:
        from azure.identity import (  # noqa: WPS433
            AuthenticationRecord,
            TokenCachePersistenceOptions,
        )
        cache_opts = TokenCachePersistenceOptions(name="dataverse-provision")
        record = None
        if os.path.exists(rec_path):
            try:
                with open(rec_path, "r", encoding="utf-8") as fh:
                    record = AuthenticationRecord.deserialize(fh.read())
            except Exception:
                record = None
        cred = DeviceCodeCredential(
            tenant_id=args.tenant, client_id=AZ_CLI_CLIENT,
            prompt_callback=_prompt,
            cache_persistence_options=cache_opts,
            authentication_record=record,
        )
        if record is None:
            # Force the interactive flow now and persist the record for reuse.
            new_record = cred.authenticate()
            try:
                with open(rec_path, "w", encoding="utf-8") as fh:
                    fh.write(new_record.serialize())
            except OSError:
                pass
        return cred
    except Exception:
        return DeviceCodeCredential(
            tenant_id=args.tenant, client_id=AZ_CLI_CLIENT, prompt_callback=_prompt,
        )


def ensure_solution(client, *, prefix: str, solution_name: str,
                    publisher_name: str, publisher_friendly: str,
                    option_value_prefix: int) -> str:
    """Ensure a publisher (by customization prefix) and solution (by unique name)
    exist, creating them idempotently. Returns the solution unique name to
    provision into. Fills the gap that provision.py otherwise leaves (it does not
    create a publisher/solution, so pt_-prefixed objects would be rejected by the
    Default Solution's publisher)."""
    # 1) Publisher — reuse any existing publisher that already owns this prefix.
    pubs = client.records.list(
        "publisher",
        filter=f"customizationprefix eq '{prefix}'",
        select=["publisherid", "uniquename", "friendlyname", "customizationprefix"],
        top=1,
    )
    rows = list(getattr(pubs, "value", None) or getattr(pubs, "records", None) or pubs)
    if rows:
        pub = rows[0]
        publisher_id = pub["publisherid"]
        log(f"   publisher '{pub.get('uniquename')}' (prefix '{prefix}') exists — reuse")
    else:
        pub_unique = publisher_name or f"{prefix}publisher"
        publisher_id = client.records.create("publisher", {
            "uniquename": pub_unique,
            "friendlyname": publisher_friendly or pub_unique,
            "customizationprefix": prefix,
            "customizationoptionvalueprefix": option_value_prefix,
        })
        log(f"   created publisher '{pub_unique}' (prefix '{prefix}', optvalprefix {option_value_prefix})")

    # 2) Solution — reuse by unique name, else create under the publisher.
    sols = client.records.list(
        "solution",
        filter=f"uniquename eq '{solution_name}'",
        select=["solutionid", "uniquename"],
        top=1,
    )
    srows = list(getattr(sols, "value", None) or getattr(sols, "records", None) or sols)
    if srows:
        log(f"   solution '{solution_name}' exists — reuse")
    else:
        client.records.create("solution", {
            "uniquename": solution_name,
            "friendlyname": solution_name,
            "version": "1.0.0.0",
            "publisherid@odata.bind": f"/publishers({publisher_id})",
        })
        log(f"   created solution '{solution_name}' under publisher prefix '{prefix}'")
    return solution_name


def main() -> int:
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser(description="Provision Dataverse schema from a PACAF planning payload")
    ap.add_argument("--payload", default="dataverse/planning-payload.json")
    ap.add_argument("--url", default=os.environ.get("PP_ENV_DEV"), help="Dataverse org URL")
    ap.add_argument("--solution", default=None, help="Solution unique name to own new objects")
    ap.add_argument("--prefix", default=None, help="Override publisher prefix (else payload.publisher.prefix)")
    ap.add_argument("--auth", choices=["devicecode", "azurecli", "env"], default="devicecode")
    ap.add_argument("--tenant", default=None, help="Tenant GUID or verified domain (devicecode)")
    ap.add_argument("--dry-run", action="store_true", help="Print the plan; do not connect or mutate")
    ap.add_argument("--yes", action="store_true", help="Skip the confirmation prompt")
    ap.add_argument("--ensure-solution", action="store_true",
                    help="Create the publisher (matching the payload/prefix) and solution if they do not exist, then provision into that solution.")
    ap.add_argument("--publisher-name", default=None, help="Publisher unique name (default: derived from prefix)")
    ap.add_argument("--publisher-friendly", default=None, help="Publisher friendly name (default: payload publisher.displayName)")
    ap.add_argument("--option-value-prefix", type=int, default=10000,
                    help="Publisher customization option-value prefix (default 10000 => option values based at 100000000). Only used when creating a new publisher.")
    args = ap.parse_args()

    payload = load_payload(args.payload)
    prefix = args.prefix or payload["publisher"]["prefix"]
    enums = build_option_enums(payload)
    tables = payload["tables"]
    tables_by_logical = {t["tableLogicalName"]: t["logicalSingularName"] for t in tables}
    # also map entity-set style targets to singular logical names
    for t in tables:
        tables_by_logical[t["entitySetName"]] = t["logicalSingularName"]

    payload_prefix = payload["publisher"]["prefix"]
    log("=" * 70)
    log(f" dataverse-provision - {'DRY RUN' if args.dry_run else 'LIVE'}")
    log("=" * 70)
    log(f" payload      : {args.payload}")
    log(f" org url      : {args.url or '(unset)'}")
    log(f" prefix       : {prefix}")
    log(f" solution     : {args.solution or '(default solution)'}")
    if prefix != payload_prefix:
        log(f" ! PREFIX OVERRIDE: payload uses '{payload_prefix}', you passed '{prefix}'.")
    log(f" option sets  : {len(enums)}  (created LOCAL per column)")
    log(f" tables       : {len(tables)}")
    log("-" * 70)

    # Build the plan
    plan = []
    for t in tables:
        create_cols, lookups = plan_table(t, enums)
        plan.append({"table": t, "columns": create_cols, "lookups": lookups})
        log(f" TABLE {t['schemaName']}  ({t.get('ownership','UserOwned')})  \"{t['displayName']}\"")
        log(f"   primary: {t['primaryName']['schemaName']}")
        for name, spec in create_cols.items():
            kind = spec.__name__ if isinstance(spec, type) else spec
            log(f"   + col   {name:<28} {kind}")
        for lk in lookups:
            tgt = resolve_target(lk["target"], tables_by_logical)
            req = " (required)" if lk["required"] else ""
            log(f"   ~ lookup {lk['field']:<27} -> {tgt}{req}")
    log("-" * 70)

    if args.dry_run:
        log(" DRY RUN complete — nothing was created. Re-run without --dry-run to apply.")
        return 0

    if not args.url:
        sys.exit("ERROR: --url is required for a live run (or set PP_ENV_DEV).")
    if not args.yes:
        resp = input(f" Provision into {args.url}? type 'yes' to proceed: ").strip().lower()
        if resp != "yes":
            log(" Aborted.")
            return 1

    from PowerPlatform.Dataverse import DataverseClient  # lazy import

    cred = make_credential(args)
    client = DataverseClient(args.url, cred)
    log(" connected. provisioning…")

    if args.ensure_solution:
        if not args.solution:
            args.solution = payload.get("solution", {}).get("uniqueName") or "ProjectTracker"
        log(f" ensuring publisher (prefix '{prefix}') + solution '{args.solution}'…")
        args.solution = ensure_solution(
            client,
            prefix=prefix,
            solution_name=args.solution,
            publisher_name=args.publisher_name,
            publisher_friendly=args.publisher_friendly or payload["publisher"].get("displayName"),
            option_value_prefix=args.option_value_prefix,
        )

    # 1) Tables + columns (idempotent)
    for entry in plan:
        t = entry["table"]
        logical = t["logicalSingularName"]
        try:
            existing = client.tables.get(logical)
        except Exception:
            existing = None
        if existing is None:
            client.tables.create(
                t["schemaName"],
                entry["columns"],
                solution=args.solution,
                primary_column=t["primaryName"]["schemaName"],
                display_name=t["displayName"],
            )
            log(f"   created table {t['schemaName']} (+{len(entry['columns'])} cols)")
        else:
            try:
                cols = client.tables.list_columns(logical) or []
                have = {c.lower() for c in cols}
            except Exception:
                have = {c.lower() for c in getattr(existing, "columns", {}) or {}}
            missing = {k: v for k, v in entry["columns"].items() if k.lower() not in have}
            if missing:
                client.tables.add_columns(t["schemaName"], missing)
                log(f"   table {t['schemaName']} exists — added {len(missing)} missing cols")
            else:
                log(f"   table {t['schemaName']} exists — up to date")

    # 2) Lookups / relationships (idempotent) — after all tables exist
    for entry in plan:
        t = entry["table"]
        referencing = t["logicalSingularName"]
        for lk in entry["lookups"]:
            target = resolve_target(lk["target"], tables_by_logical)
            try:
                existing_rels = client.tables.list_columns(referencing)
                have = {c.lower() for c in (existing_rels or [])}
            except Exception:
                have = set()
            if lk["field"].lower() in have:
                log(f"   lookup {lk['field']} exists — skip")
                continue
            # Dataverse metadata ops are async; a just-created table can still be
            # "customizing" when the next relationship starts. Retry the transient
            # EntityCustomization concurrency error with backoff.
            attempts = 0
            while True:
                attempts += 1
                try:
                    client.tables.create_lookup_field(
                        referencing_table=referencing,
                        lookup_field_name=lk["field"],
                        referenced_table=target,
                        display_name=lk["display"],
                        required=lk["required"],
                        solution=args.solution,
                    )
                    break
                except Exception as exc:  # noqa: BLE001
                    msg = str(exc)
                    transient = "EntityCustomization" in msg or "try again later" in msg
                    if transient and attempts <= 8:
                        wait = min(5 * attempts, 30)
                        log(f"   lookup {lk['field']} transient conflict — retry {attempts} in {wait}s")
                        time.sleep(wait)
                        continue
                    raise
            log(f"   created lookup {referencing}.{lk['field']} -> {target}")

    client.close()
    log("=" * 70)
    log(" provisioning complete.")
    log(" Next: register data sources — for each table run")
    log("   pac code add-data-source -a dataverse -t <tableLogicalName>")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
