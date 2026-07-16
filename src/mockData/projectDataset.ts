// Deterministic, correlated prototype dataset for the Project Tracker.
// A curated resource library + generated projects + assignment links, with
// Dataverse-style rollups (resourceCount, usageCount, lastUsedOn) computed
// from the assignment graph so the prototype behaves like the real schema.
//
// Named exports are re-exported by the seed-generated files
// (project.ts / resource.ts / assignment.ts).

import type { Project, Resource, Assignment } from '@/types/domain-models';
import { mockClients, mockTeamMembers } from '@/mockData/reference';
import { labelOf, practiceAreaSet } from '@/lib/optionSets';
import { isoDate } from '@/lib/format';

// Practice-area values
const PA = {
  product: 100000000,
  regulatory: 100000001,
  clinical: 100000002,
  manufacturing: 100000003,
  commercial: 100000004,
  it: 100000005,
  ops: 100000006,
};

// ── Curated resource library ───────────────────────────────────────────────
interface ResourceSeed {
  id: string;
  name: string;
  resourceType: number;
  practiceArea: number;
  maturity: number;
  resourceUrl: string;
  description: string;
  owner: string;
}

const resourceSeeds: ResourceSeed[] = [
  { id: 'res-clinical-sop', name: 'Clinical Trial SOP Pack', resourceType: 100000003, practiceArea: PA.clinical, maturity: 100000002, resourceUrl: 'https://library.demo/clinical-trial-sop', description: 'Standard operating procedures for running a Phase II/III clinical trial, ready to tailor per study.', owner: 'user-priya' },
  { id: 'res-510k-template', name: '510(k) Submission Template', resourceType: 100000000, practiceArea: PA.regulatory, maturity: 100000002, resourceUrl: 'https://library.demo/510k-template', description: 'FDA 510(k) premarket submission template with pre-filled sections and reviewer checklist.', owner: 'user-liam' },
  { id: 'res-capa-tracker', name: 'CAPA Tracker Tool', resourceType: 100000002, practiceArea: PA.clinical, maturity: 100000001, resourceUrl: 'https://sandbox.demo/capa-tracker', description: 'Corrective and preventive action tracker with due-date automation and audit history.', owner: 'user-priya' },
  { id: 'res-mfg-validation', name: 'Manufacturing Validation Dataset', resourceType: 100000001, practiceArea: PA.manufacturing, maturity: 100000001, resourceUrl: 'https://library.demo/mfg-validation', description: 'Sample IQ/OQ/PQ validation dataset for a sterile manufacturing line.', owner: 'user-jordan' },
  { id: 'res-supplier-audit', name: 'Supplier Audit Playbook', resourceType: 100000003, practiceArea: PA.manufacturing, maturity: 100000002, resourceUrl: 'https://library.demo/supplier-audit', description: 'End-to-end supplier qualification and audit playbook with scoring rubric.', owner: 'user-jordan' },
  { id: 'res-pharma-stability', name: 'Stability Study Dataset', resourceType: 100000001, practiceArea: PA.clinical, maturity: 100000001, resourceUrl: 'https://library.demo/stability-study', description: 'ICH-aligned stability study dataset spanning 24 months of accelerated and long-term conditions.', owner: 'user-priya' },
  { id: 'res-gmp-checklist', name: 'GMP Compliance Checklist', resourceType: 100000000, practiceArea: PA.regulatory, maturity: 100000002, resourceUrl: 'https://library.demo/gmp-checklist', description: 'Good Manufacturing Practice readiness checklist mapped to 21 CFR Part 211.', owner: 'user-liam' },
  { id: 'res-launch-playbook', name: 'Product Launch Playbook', resourceType: 100000003, practiceArea: PA.commercial, maturity: 100000002, resourceUrl: 'https://library.demo/product-launch', description: 'Cross-functional go-to-market playbook covering pricing, positioning, and launch gates.', owner: 'user-sofia' },
  { id: 'res-market-access', name: 'Market Access Reference', resourceType: 100000005, practiceArea: PA.commercial, maturity: 100000001, resourceUrl: 'https://library.demo/market-access', description: 'Payer landscape and reimbursement reference for new therapeutics and devices.', owner: 'user-sofia' },
  { id: 'res-crm-sandbox', name: 'CRM Sandbox Environment', resourceType: 100000004, practiceArea: PA.it, maturity: 100000001, resourceUrl: 'https://sandbox.demo/crm', description: 'Pre-seeded CRM sandbox for testing commercial workflows without touching production.', owner: 'user-marcus' },
  { id: 'res-data-lakehouse', name: 'Analytics Lakehouse Sandbox', resourceType: 100000004, practiceArea: PA.it, maturity: 100000002, resourceUrl: 'https://sandbox.demo/lakehouse', description: 'Governed lakehouse with sample enterprise data, notebooks, and a reporting layer.', owner: 'user-marcus' },
  { id: 'res-erp-integration', name: 'ERP Integration Toolkit', resourceType: 100000002, practiceArea: PA.ops, maturity: 100000001, resourceUrl: 'https://sandbox.demo/erp-toolkit', description: 'Connectors and mapping templates for integrating an ERP with downstream systems.', owner: 'user-marcus' },
  { id: 'res-budget-model', name: 'Budget Planning Model', resourceType: 100000000, practiceArea: PA.ops, maturity: 100000001, resourceUrl: 'https://library.demo/budget-model', description: 'Driver-based budget and forecast model with scenario toggles.', owner: 'user-avery' },
  { id: 'res-risk-register', name: 'Enterprise Risk Register', resourceType: 100000002, practiceArea: PA.ops, maturity: 100000002, resourceUrl: 'https://sandbox.demo/risk-register', description: 'Portfolio-wide risk register with likelihood/impact scoring and mitigation tracking.', owner: 'user-avery' },
];

export const resources: Resource[] = resourceSeeds.map((r) => ({
  id: r.id,
  name: r.name,
  resourceType: r.resourceType,
  practiceArea: r.practiceArea,
  maturity: r.maturity,
  resourceUrl: r.resourceUrl,
  description: r.description,
  owner: r.owner,
  usageCount: 0,
  lastUsedOn: undefined,
}));

// ── Deterministic PRNG (mulberry32) ────────────────────────────────────────
function mulberry32(seed: number) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260715);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const chance = (p: number) => rand() < p;

const PROJECT_COUNT = 46;
const areaWeights = [PA.product, PA.product, PA.clinical, PA.clinical, PA.clinical, PA.regulatory, PA.regulatory, PA.manufacturing, PA.manufacturing, PA.commercial, PA.commercial, PA.it, PA.ops];
const types = [100000000, 100000001, 100000001, 100000002, 100000003];
const statuses = [100000000, 100000001, 100000001, 100000002, 100000003];
const outcomes = [100000000, 100000000, 100000001, 100000002, 100000003];
const riskReasons = [100000000, 100000000, 100000001, 100000002, 100000003];

const resourcesByArea = new Map<number, ResourceSeed[]>();
for (const r of resourceSeeds) {
  const list = resourcesByArea.get(r.practiceArea) ?? [];
  list.push(r);
  resourcesByArea.set(r.practiceArea, list);
}

const projectList: Project[] = [];
const assignmentList: Assignment[] = [];
const usageCounter = new Map<string, number>();
const lastUsed = new Map<string, string>();

const today = new Date();
for (let i = 0; i < PROJECT_COUNT; i++) {
  const area = pick(areaWeights);
  const client = pick(mockClients);
  const projectLead = pick(mockTeamMembers);
  // Spread over the last ~182 days, weighted slightly toward recent.
  const daysAgo = Math.floor(Math.pow(rand(), 1.3) * 182);
  const date = new Date(today);
  date.setDate(today.getDate() - daysAgo);
  const startDate = isoDate(date);

  const id = `project-${String(i + 1).padStart(2, '0')}`;
  const areaLabel = labelOf(practiceAreaSet, area);
  const candidateResources = resourcesByArea.get(area) ?? [];

  // ~72% of projects are resourced when resources exist for the area.
  const resourced = candidateResources.length > 0 && chance(0.72);
  let resourceCount = 0;
  let riskReason: number | undefined;

  if (resourced) {
    const shuffled = [...candidateResources].sort(() => rand() - 0.5);
    const take = 1 + Math.floor(rand() * Math.min(3, shuffled.length));
    const chosen = shuffled.slice(0, take);
    resourceCount = chosen.length;
    for (const resource of chosen) {
      assignmentList.push({
        id: `assignment-${id}-${resource.id}`,
        name: `${client.name} ↔ ${resource.name}`,
        project: id,
        resource: resource.id,
        assignmentNote: undefined,
      });
      usageCounter.set(resource.id, (usageCounter.get(resource.id) ?? 0) + 1);
      const prev = lastUsed.get(resource.id);
      if (!prev || startDate > prev) lastUsed.set(resource.id, startDate);
    }
  } else {
    riskReason = pick(riskReasons);
  }

  projectList.push({
    id,
    name: `${client.name} — ${areaLabel}`,
    startDate,
    client: client.id,
    projectLead: projectLead.id,
    practiceArea: area,
    projectType: pick(types),
    status: pick(statuses),
    outcome: pick(outcomes),
    teamSize: 2 + Math.floor(rand() * 40),
    riskReason,
    resourceCount,
  });
}

// Apply computed rollups back onto resources.
for (const resource of resources) {
  resource.usageCount = usageCounter.get(resource.id) ?? 0;
  resource.lastUsedOn = lastUsed.get(resource.id);
}

// Sort projects newest-first for a natural default list order.
projectList.sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

export const projects: Project[] = projectList;
export const assignments: Assignment[] = assignmentList;
