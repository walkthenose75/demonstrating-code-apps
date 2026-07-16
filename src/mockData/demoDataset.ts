// Deterministic, correlated prototype dataset for the demo-asset tracker.
// A curated asset catalog + generated demo deliveries + usage links, with
// Dataverse-style rollups (linkedAssetCount, reuseCount, lastUsedOn) computed
// from the usage graph so the prototype behaves like the real schema.
//
// Regenerated named exports are re-exported by the seed-generated files
// (demoDelivery.ts / demoAsset.ts / demoAssetUsage.ts).

import type { DemoAsset, DemoAssetUsage, DemoDelivery } from '@/types/domain-models';
import { mockCustomers, mockSellers } from '@/mockData/reference';
import { labelOf, solutionAreaSet } from '@/lib/optionSets';
import { isoDate } from '@/lib/format';

// Solution-area values
const SA = {
  azure: 100000000,
  dataAi: 100000001,
  security: 100000002,
  modernWork: 100000003,
  bizApps: 100000004,
  copilot: 100000005,
  other: 100000006,
};

// ── Curated asset catalog ──────────────────────────────────────────────────
interface AssetSeed {
  id: string;
  name: string;
  assetType: number;
  solutionArea: number;
  maturity: number;
  assetUrl: string;
  description: string;
  maintainer: string;
}

const assetSeeds: AssetSeed[] = [
  { id: 'asset-aks-landing', name: 'AKS Secure Landing Zone', assetType: 100000000, solutionArea: SA.azure, maturity: 100000002, assetUrl: 'https://github.com/demo/aks-landing-zone', description: 'One-command AKS cluster with baseline policies, ingress, and observability wired up.', maintainer: 'user-jordan' },
  { id: 'asset-arc-hybrid', name: 'Azure Arc Hybrid Ops Sandbox', assetType: 100000001, solutionArea: SA.azure, maturity: 100000001, assetUrl: 'https://sandbox.demo/arc-hybrid', description: 'Pre-provisioned hybrid estate showing Arc-enabled servers, policy, and update management.', maintainer: 'user-jordan' },
  { id: 'asset-fabric-lakehouse', name: 'Microsoft Fabric Lakehouse Tour', assetType: 100000004, solutionArea: SA.dataAi, maturity: 100000002, assetUrl: 'https://sandbox.demo/fabric-lakehouse', description: 'Interactive Fabric workspace: ingestion, lakehouse, notebooks, and a Power BI story.', maintainer: 'user-priya' },
  { id: 'asset-aoai-rag', name: 'Azure OpenAI RAG Reference App', assetType: 100000000, solutionArea: SA.dataAi, maturity: 100000001, assetUrl: 'https://github.com/demo/aoai-rag', description: 'Retrieval-augmented chat over your own docs, deployable in ~10 minutes.', maintainer: 'user-priya' },
  { id: 'asset-sentinel-soc', name: 'Sentinel SOC-in-a-Box', assetType: 100000001, solutionArea: SA.security, maturity: 100000002, assetUrl: 'https://sandbox.demo/sentinel-soc', description: 'Live Sentinel workspace with seeded incidents, hunting queries, and SOAR playbooks.', maintainer: 'user-liam' },
  { id: 'asset-entra-zt', name: 'Entra Zero Trust Walkthrough', assetType: 100000003, solutionArea: SA.security, maturity: 100000001, assetUrl: 'https://videos.demo/entra-zero-trust', description: 'Recorded conditional-access + PIM + identity protection narrative.', maintainer: 'user-liam' },
  { id: 'asset-purview-dlp', name: 'Purview DLP Quickstart', assetType: 100000002, solutionArea: SA.security, maturity: 100000000, assetUrl: 'https://github.com/demo/purview-dlp', description: 'Scripted DLP policy rollout with sample sensitive data.', maintainer: 'user-liam' },
  { id: 'asset-copilot-m365', name: 'Copilot for M365 Scenario Pack', assetType: 100000004, solutionArea: SA.copilot, maturity: 100000002, assetUrl: 'https://sandbox.demo/copilot-m365', description: 'Guided tenant with realistic content across Word, Excel, Teams, and Outlook.', maintainer: 'user-sofia' },
  { id: 'asset-copilot-studio', name: 'Copilot Studio Agent Builder', assetType: 100000000, solutionArea: SA.copilot, maturity: 100000001, assetUrl: 'https://github.com/demo/copilot-studio-agent', description: 'Starter Copilot Studio agent with knowledge, actions, and a Teams channel.', maintainer: 'user-sofia' },
  { id: 'asset-teams-phone', name: 'Teams Phone & Rooms Tour', assetType: 100000003, solutionArea: SA.modernWork, maturity: 100000001, assetUrl: 'https://videos.demo/teams-phone', description: 'Recorded end-to-end calling, meetings, and Teams Rooms experience.', maintainer: 'user-avery' },
  { id: 'asset-viva-insights', name: 'Viva Insights Leadership Demo', assetType: 100000005, solutionArea: SA.modernWork, maturity: 100000000, assetUrl: 'https://slides.demo/viva-insights', description: 'Slide-embedded interactive charts for an exec Viva conversation.', maintainer: 'user-avery' },
  { id: 'asset-powerapps-field', name: 'Power Apps Field Service App', assetType: 100000001, solutionArea: SA.bizApps, maturity: 100000002, assetUrl: 'https://sandbox.demo/field-service', description: 'Deployed model-driven + canvas field-service scenario with sample work orders.', maintainer: 'user-marcus' },
  { id: 'asset-automate-invoice', name: 'Power Automate Invoice Flow', assetType: 100000002, solutionArea: SA.bizApps, maturity: 100000001, assetUrl: 'https://github.com/demo/automate-invoice', description: 'Invoice-to-approval flow with AI Builder document processing.', maintainer: 'user-marcus' },
  { id: 'asset-dynamics-sales', name: 'Dynamics 365 Sales Copilot Demo', assetType: 100000004, solutionArea: SA.bizApps, maturity: 100000001, assetUrl: 'https://sandbox.demo/d365-sales', description: 'Sales pipeline with Copilot summarization and next-best-action.', maintainer: 'user-marcus' },
];

export const demoAssets: DemoAsset[] = assetSeeds.map((a) => ({
  id: a.id,
  name: a.name,
  assetType: a.assetType,
  solutionArea: a.solutionArea,
  maturity: a.maturity,
  assetUrl: a.assetUrl,
  description: a.description,
  maintainer: a.maintainer,
  reuseCount: 0,
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

const DELIVERY_COUNT = 46;
const areaWeights = [SA.azure, SA.azure, SA.dataAi, SA.dataAi, SA.dataAi, SA.security, SA.security, SA.copilot, SA.copilot, SA.copilot, SA.modernWork, SA.bizApps, SA.other];
const formats = [100000000, 100000001, 100000001, 100000002, 100000003];
const stages = [100000000, 100000001, 100000001, 100000002, 100000003];
const outcomes = [100000000, 100000000, 100000001, 100000002, 100000003];
const gapReasons = [100000000, 100000000, 100000001, 100000002, 100000003];

const assetsByArea = new Map<number, AssetSeed[]>();
for (const a of assetSeeds) {
  const list = assetsByArea.get(a.solutionArea) ?? [];
  list.push(a);
  assetsByArea.set(a.solutionArea, list);
}

const deliveries: DemoDelivery[] = [];
const usages: DemoAssetUsage[] = [];
const reuseCounter = new Map<string, number>();
const lastUsed = new Map<string, string>();

const today = new Date();
for (let i = 0; i < DELIVERY_COUNT; i++) {
  const area = pick(areaWeights);
  const customer = pick(mockCustomers);
  const presenter = pick(mockSellers);
  // Spread over the last ~182 days, weighted slightly toward recent.
  const daysAgo = Math.floor(Math.pow(rand(), 1.3) * 182);
  const date = new Date(today);
  date.setDate(today.getDate() - daysAgo);
  const deliveryDate = isoDate(date);

  const id = `delivery-${String(i + 1).padStart(2, '0')}`;
  const areaLabel = labelOf(solutionAreaSet, area);
  const candidateAssets = assetsByArea.get(area) ?? [];

  // ~72% of deliveries are asset-backed when assets exist for the area.
  const covered = candidateAssets.length > 0 && chance(0.72);
  let linkedAssetCount = 0;
  let assetGapReason: number | undefined;

  if (covered) {
    const shuffled = [...candidateAssets].sort(() => rand() - 0.5);
    const take = 1 + Math.floor(rand() * Math.min(3, shuffled.length));
    const chosen = shuffled.slice(0, take);
    linkedAssetCount = chosen.length;
    for (const asset of chosen) {
      usages.push({
        id: `usage-${id}-${asset.id}`,
        name: `${customer.name} ↔ ${asset.name}`,
        demoDelivery: id,
        demoAsset: asset.id,
        usageNote: undefined,
      });
      reuseCounter.set(asset.id, (reuseCounter.get(asset.id) ?? 0) + 1);
      const prev = lastUsed.get(asset.id);
      if (!prev || deliveryDate > prev) lastUsed.set(asset.id, deliveryDate);
    }
  } else {
    assetGapReason = pick(gapReasons);
  }

  deliveries.push({
    id,
    name: `${customer.name} — ${areaLabel}`,
    deliveryDate,
    customer: customer.id,
    presenter: presenter.id,
    solutionArea: area,
    deliveryFormat: pick(formats),
    salesStage: pick(stages),
    outcome: pick(outcomes),
    audienceSize: 2 + Math.floor(rand() * 40),
    assetGapReason,
    linkedAssetCount,
  });
}

// Apply computed rollups back onto assets.
for (const asset of demoAssets) {
  asset.reuseCount = reuseCounter.get(asset.id) ?? 0;
  asset.lastUsedOn = lastUsed.get(asset.id);
}

// Sort deliveries newest-first for a natural default list order.
deliveries.sort((a, b) => (a.deliveryDate < b.deliveryDate ? 1 : -1));

export const demoDeliveries: DemoDelivery[] = deliveries;
export const demoAssetUsages: DemoAssetUsage[] = usages;
