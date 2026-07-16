#!/usr/bin/env python3
"""Seed the Project Tracker Dataverse tables with a coherent demo dataset.

Runs AFTER provision.py has created the 3 tables + 5 lookups. Reuses the same
device-code credential (silent, via the persisted token cache written by the
provision run), then creates records through the Dataverse Web API:

    accounts (Client)  ->  pt_resources  ->  pt_projects  ->  pt_assignments

Lookup navigation-property names are read from live relationship metadata so the
@odata.bind payloads are always correct. Idempotent: skips seeding if pt_projects
already has rows (pass --force to seed anyway).

Usage:
    py -3 dataverse/seed.py --url https://org.crm.dynamics.com \
        --tenant <tenant-guid> [--force]
"""
from __future__ import annotations

import argparse
import os
import random
import sys
from datetime import datetime, timedelta
from types import SimpleNamespace

import requests

# Reuse the provisioning skill's credential factory (same token cache/record).
SKILL_DIR = os.path.join(os.path.dirname(__file__), "..", "skills", "dataverse-provision")
sys.path.insert(0, os.path.abspath(SKILL_DIR))
from provision import make_credential, _dataverse_scope  # noqa: E402

API_VERSION = "v9.2"

# ── Reference data (mirrors src/mockData) ────────────────────────────────────
PA = {
    "product": 100000000, "regulatory": 100000001, "clinical": 100000002,
    "manufacturing": 100000003, "commercial": 100000004, "it": 100000005, "ops": 100000006,
}

CLIENTS = [
    "NovaMed Devices", "Helix Biosciences", "VitaPharm Labs", "CoreWell Health",
    "Aterra Manufacturing", "BrightPath Financial", "Summit Retail Group",
    "Orbit Logistics", "Lumen Software", "Cascade Foods", "Ironwood Energy",
    "Meridian Insurance",
]

# id -> (name, resourceType, practiceArea, maturity, url, description)
RESOURCE_SEEDS = [
    ("res-clinical-sop", "Clinical Trial SOP Pack", 100000003, PA["clinical"], 100000002, "https://library.demo/clinical-trial-sop", "Standard operating procedures for running a Phase II/III clinical trial, ready to tailor per study."),
    ("res-510k-template", "510(k) Submission Template", 100000000, PA["regulatory"], 100000002, "https://library.demo/510k-template", "FDA 510(k) premarket submission template with pre-filled sections and reviewer checklist."),
    ("res-capa-tracker", "CAPA Tracker Tool", 100000002, PA["clinical"], 100000001, "https://sandbox.demo/capa-tracker", "Corrective and preventive action tracker with due-date automation and audit history."),
    ("res-mfg-validation", "Manufacturing Validation Dataset", 100000001, PA["manufacturing"], 100000001, "https://library.demo/mfg-validation", "Sample IQ/OQ/PQ validation dataset for a sterile manufacturing line."),
    ("res-supplier-audit", "Supplier Audit Playbook", 100000003, PA["manufacturing"], 100000002, "https://library.demo/supplier-audit", "End-to-end supplier qualification and audit playbook with scoring rubric."),
    ("res-pharma-stability", "Stability Study Dataset", 100000001, PA["clinical"], 100000001, "https://library.demo/stability-study", "ICH-aligned stability study dataset spanning 24 months of accelerated and long-term conditions."),
    ("res-gmp-checklist", "GMP Compliance Checklist", 100000000, PA["regulatory"], 100000002, "https://library.demo/gmp-checklist", "Good Manufacturing Practice readiness checklist mapped to 21 CFR Part 211."),
    ("res-launch-playbook", "Product Launch Playbook", 100000003, PA["commercial"], 100000002, "https://library.demo/product-launch", "Cross-functional go-to-market playbook covering pricing, positioning, and launch gates."),
    ("res-market-access", "Market Access Reference", 100000005, PA["commercial"], 100000001, "https://library.demo/market-access", "Payer landscape and reimbursement reference for new therapeutics and devices."),
    ("res-crm-sandbox", "CRM Sandbox Environment", 100000004, PA["it"], 100000001, "https://sandbox.demo/crm", "Pre-seeded CRM sandbox for testing commercial workflows without touching production."),
    ("res-data-lakehouse", "Analytics Lakehouse Sandbox", 100000004, PA["it"], 100000002, "https://sandbox.demo/lakehouse", "Governed lakehouse with sample enterprise data, notebooks, and a reporting layer."),
    ("res-erp-integration", "ERP Integration Toolkit", 100000002, PA["ops"], 100000001, "https://sandbox.demo/erp-toolkit", "Connectors and mapping templates for integrating an ERP with downstream systems."),
    ("res-budget-model", "Budget Planning Model", 100000000, PA["ops"], 100000001, "https://library.demo/budget-model", "Driver-based budget and forecast model with scenario toggles."),
    ("res-risk-register", "Enterprise Risk Register", 100000002, PA["ops"], 100000002, "https://sandbox.demo/risk-register", "Portfolio-wide risk register with likelihood/impact scoring and mitigation tracking."),
]

AREA_LABEL = {
    PA["product"]: "Product Development", PA["regulatory"]: "Regulatory Compliance",
    PA["clinical"]: "Clinical Quality", PA["manufacturing"]: "Manufacturing & Supply",
    PA["commercial"]: "Commercial", PA["it"]: "IT & Digital", PA["ops"]: "Operations",
}
AREA_WEIGHTS = [PA["product"], PA["product"], PA["clinical"], PA["clinical"], PA["clinical"],
                PA["regulatory"], PA["regulatory"], PA["manufacturing"], PA["manufacturing"],
                PA["commercial"], PA["commercial"], PA["it"], PA["ops"]]
TYPES = [100000000, 100000001, 100000001, 100000002, 100000003]
STATUSES = [100000000, 100000001, 100000001, 100000002, 100000003]
OUTCOMES = [100000000, 100000000, 100000001, 100000002, 100000003]
RISK_REASONS = [100000000, 100000000, 100000001, 100000002, 100000003]
PROJECT_COUNT = 42


class Dv:
    """Thin Dataverse Web API client."""

    def __init__(self, url: str, token: str):
        self.base = f"{url.rstrip('/')}/api/data/{API_VERSION}/"
        self.s = requests.Session()
        self.s.headers.update({
            "Authorization": f"Bearer {token}",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Accept": "application/json",
            "Content-Type": "application/json; charset=utf-8",
            "Prefer": "return=representation",
        })

    def whoami(self) -> str:
        r = self.s.get(self.base + "WhoAmI")
        r.raise_for_status()
        return r.json()["UserId"]

    def nav_props(self, table_logical: str) -> dict[str, str]:
        """Map referencing attribute -> navigation property for N:1 lookups."""
        q = (f"EntityDefinitions(LogicalName='{table_logical}')"
             "?$select=LogicalName&$expand=ManyToOneRelationships("
             "$select=ReferencingAttribute,ReferencingEntityNavigationPropertyName)")
        r = self.s.get(self.base + q)
        r.raise_for_status()
        rels = r.json().get("ManyToOneRelationships", [])
        return {rel["ReferencingAttribute"]: rel["ReferencingEntityNavigationPropertyName"]
                for rel in rels}

    def count(self, entity_set: str) -> int:
        r = self.s.get(self.base + f"{entity_set}?$select={entity_set[:-1]}id&$top=1")
        r.raise_for_status()
        return len(r.json().get("value", []))

    def find_account(self, name: str) -> str | None:
        safe = name.replace("'", "''")
        r = self.s.get(self.base + f"accounts?$select=accountid&$filter=name eq '{safe}'&$top=1")
        r.raise_for_status()
        vals = r.json().get("value", [])
        return vals[0]["accountid"] if vals else None

    def create(self, entity_set: str, body: dict, id_field: str) -> str:
        r = self.s.post(self.base + entity_set, json=body)
        if r.status_code >= 300:
            raise RuntimeError(f"POST {entity_set} -> {r.status_code}: {r.text[:400]}")
        return r.json()[id_field]


def iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT00:00:00Z")


def build_dataset():
    rng = random.Random(20260716)
    resources = []
    for rid, name, rtype, area, maturity, url, desc in RESOURCE_SEEDS:
        resources.append({"id": rid, "name": name, "resourceType": rtype, "practiceArea": area,
                          "maturity": maturity, "url": url, "description": desc,
                          "usageCount": 0, "lastUsedOn": None})
    by_area: dict[int, list] = {}
    for r in resources:
        by_area.setdefault(r["practiceArea"], []).append(r)

    projects, assignments = [], []
    today = datetime.utcnow()
    for i in range(PROJECT_COUNT):
        area = rng.choice(AREA_WEIGHTS)
        client = rng.choice(CLIENTS)
        days_ago = int((rng.random() ** 1.3) * 182)
        start = today - timedelta(days=days_ago)
        pid = f"project-{i + 1:02d}"
        candidates = by_area.get(area, [])
        resourced = candidates and rng.random() < 0.72
        risk = None
        chosen = []
        if resourced:
            shuffled = candidates[:]
            rng.shuffle(shuffled)
            take = 1 + int(rng.random() * min(3, len(shuffled)))
            chosen = shuffled[:take]
            for res in chosen:
                assignments.append({"id": f"assignment-{pid}-{res['id']}",
                                    "name": f"{client} \u2194 {res['name']}",
                                    "project": pid, "resource": res["id"]})
                res["usageCount"] += 1
                s = iso(start)
                if not res["lastUsedOn"] or s > res["lastUsedOn"]:
                    res["lastUsedOn"] = s
        else:
            risk = rng.choice(RISK_REASONS)
        projects.append({
            "id": pid, "name": f"{client} \u2014 {AREA_LABEL[area]}", "client": client,
            "startDate": iso(start), "practiceArea": area, "projectType": rng.choice(TYPES),
            "status": rng.choice(STATUSES), "outcome": rng.choice(OUTCOMES),
            "teamSize": 2 + int(rng.random() * 40), "riskReason": risk,
            "resourceCount": len(chosen),
        })
    return resources, projects, assignments


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=os.environ.get("PP_ENV_DEV"))
    ap.add_argument("--tenant", default=os.environ.get("PP_TENANT_ID"))
    ap.add_argument("--auth", default="devicecode")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()
    if not args.url:
        sys.exit("ERROR: --url (or PP_ENV_DEV) is required.")

    cred = make_credential(SimpleNamespace(auth=args.auth, tenant=args.tenant, url=args.url))
    token = cred.get_token(_dataverse_scope(args.url)).token
    dv = Dv(args.url, token)

    user_id = dv.whoami()
    print(f"[seed] connected; current user {user_id}")

    if not args.force and dv.count("pt_projects") > 0:
        print("[seed] pt_projects already has rows - skipping (use --force to reseed).")
        return

    proj_nav = dv.nav_props("pt_project")
    res_nav = dv.nav_props("pt_resource")
    asg_nav = dv.nav_props("pt_assignment")
    print(f"[seed] nav props: project={proj_nav} resource={res_nav} assignment={asg_nav}")

    resources, projects, assignments = build_dataset()

    # Accounts (Client) — reuse by name, else create.
    account_ids: dict[str, str] = {}
    for name in CLIENTS:
        existing = dv.find_account(name)
        account_ids[name] = existing or dv.create("accounts", {"name": name}, "accountid")
    print(f"[seed] accounts ready: {len(account_ids)}")

    # Resources (owner -> current user).
    res_ids: dict[str, str] = {}
    owner_nav = res_nav.get("pt_owner")
    for r in resources:
        body = {
            "pt_resourcename": r["name"], "pt_resourcetype": r["resourceType"],
            "pt_practicearea": r["practiceArea"], "pt_maturity": r["maturity"],
            "pt_resourceurl": r["url"], "pt_description": r["description"],
            "pt_usagecount": r["usageCount"],
        }
        if r["lastUsedOn"]:
            body["pt_lastusedon"] = r["lastUsedOn"]
        if owner_nav:
            body[f"{owner_nav}@odata.bind"] = f"/systemusers({user_id})"
        res_ids[r["id"]] = dv.create("pt_resources", body, "pt_resourceid")
    print(f"[seed] resources created: {len(res_ids)}")

    # Projects (client -> account, lead -> current user).
    proj_ids: dict[str, str] = {}
    client_nav = proj_nav.get("pt_client")
    lead_nav = proj_nav.get("pt_projectlead")
    for p in projects:
        body = {
            "pt_projectname": p["name"], "pt_startdate": p["startDate"],
            "pt_practicearea": p["practiceArea"], "pt_projecttype": p["projectType"],
            "pt_status": p["status"], "pt_outcome": p["outcome"],
            "pt_teamsize": p["teamSize"], "pt_resourcecount": p["resourceCount"],
        }
        if p["riskReason"] is not None:
            body["pt_riskreason"] = p["riskReason"]
        if client_nav:
            body[f"{client_nav}@odata.bind"] = f"/accounts({account_ids[p['client']]})"
        if lead_nav:
            body[f"{lead_nav}@odata.bind"] = f"/systemusers({user_id})"
        proj_ids[p["id"]] = dv.create("pt_projects", body, "pt_projectid")
    print(f"[seed] projects created: {len(proj_ids)}")

    # Assignments (project + resource lookups, both required).
    project_nav = asg_nav.get("pt_project")
    resource_nav = asg_nav.get("pt_resource")
    made = 0
    for a in assignments:
        body = {"pt_assignmentname": a["name"]}
        body[f"{project_nav}@odata.bind"] = f"/pt_projects({proj_ids[a['project']]})"
        body[f"{resource_nav}@odata.bind"] = f"/pt_resources({res_ids[a['resource']]})"
        dv.create("pt_assignments", body, "pt_assignmentid")
        made += 1
    print(f"[seed] assignments created: {made}")
    print("[seed] DONE")


if __name__ == "__main__":
    main()
