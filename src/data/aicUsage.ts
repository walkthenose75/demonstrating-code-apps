// AI Build Cost snapshot — the "AIC" (AI Consumption) telemetry for building this
// app, exported from the aic-tracker skill ledger. This is BUILD metadata, not
// runtime app data, so it is a static module (no data provider needed).
//
// Refreshed at each checkpoint from `calc_aic.py --json`. Cost is a cache-aware
// estimate using public list prices; credits are GitHub Copilot premium requests
// (user turns x per-model multiplier). See ~/.copilot/skills/aic-tracker.

export interface AicCostBreakdown {
  freshInputUsd: number;
  cacheReadUsd: number;
  cacheWriteUsd: number;
  outputUsd: number;
}

export interface AicModelUsage {
  model: string;
  vendor: string;
  inputTokens: number;
  freshInputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  outputTokens: number;
  costUsd: number;
  credits: number;
  events: number;
  /** Rate card used (USD per 1M tokens) for transparency in the dashboard. */
  rates: { input: number; output: number; cacheWrite: number; cacheRead: number; copilotMultiplier: number };
}

export interface AicCheckpoint {
  label: string;
  timestamp: string;
  cumulativeCostUsd: number;
  cumulativeCredits: number;
  deltaCostUsd: number;
}

/** A single line item in the "what it would take to build this by hand" estimate. */
export interface ManualBuildTask {
  task: string;
  hours: number;
}

/**
 * Manual (human-built) baseline for the same app, so the dashboard can contrast
 * an AI-agent build against a hand-built one on both time and cost.
 * Hours are a transparent, line-item estimate for an experienced Power Platform
 * maker building the equivalent app in the UI (Dataverse schema + data + 6
 * screens + dashboards + CRUD). Rates are fully-loaded labor rates.
 */
export interface ManualBuildComparison {
  internalRateUsd: number;   // fully-loaded internal employee rate ($/hr)
  consultantRateUsd: number; // external consultant rate ($/hr)
  tasks: ManualBuildTask[];  // sum of hours = estimated manual effort
  note: string;
}

export interface AicUsage {
  capturedAt: string;
  currency: 'USD';
  totals: {
    costUsd: number;
    credits: number;
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    freshInputTokens: number;
    userTurns: number;
    modelEvents: number;
  };
  breakdown: AicCostBreakdown;
  time: {
    wallSeconds: number;
    activeSeconds: number;
    firstActivity: string;
    lastActivity: string;
  };
  models: AicModelUsage[];
  checkpoints: AicCheckpoint[];
  /** Human note about basis + caveats, surfaced in the dashboard footer. */
  basis: string;
}

export const aicUsage: AicUsage = {
  capturedAt: '2026-07-16T16:58:04Z',
  currency: 'USD',
  totals: {
    costUsd: 351.25,
    credits: 830,
    inputTokens: 114819057,
    outputTokens: 868172,
    cacheReadTokens: 107711205,
    cacheWriteTokens: 6672595,
    freshInputTokens: 435257,
    userTurns: 83,
    modelEvents: 845,
  },
  breakdown: {
    freshInputUsd: 1.9736,
    cacheReadUsd: 159.9173,
    cacheWriteUsd: 125.1112,
    outputUsd: 64.2437,
  },
  time: {
    wallSeconds: 85278,
    activeSeconds: 12514,
    firstActivity: '2026-07-15T17:16:46Z',
    lastActivity: '2026-07-16T16:58:04Z',
  },
  models: [
    {
      model: 'claude-opus-4.8',
      vendor: 'Anthropic',
      inputTokens: 113288149,
      freshInputTokens: 103965,
      cacheReadTokens: 106511589,
      cacheWriteTokens: 6672595,
      outputTokens: 854799,
      costUsd: 350.55,
      credits: 830,
      events: 824,
      rates: { input: 15.0, output: 75.0, cacheWrite: 18.75, cacheRead: 1.5, copilotMultiplier: 10 },
    },
    {
      model: 'gpt-5.5',
      vendor: 'OpenAI',
      inputTokens: 1530908,
      freshInputTokens: 331292,
      cacheReadTokens: 1199616,
      cacheWriteTokens: 0,
      outputTokens: 13373,
      costUsd: 0.70,
      credits: 0,
      events: 21,
      rates: { input: 1.25, output: 10.0, cacheWrite: 1.25, cacheRead: 0.125, copilotMultiplier: 1 },
    },
  ],
  checkpoints: [
    {
      label: 'phase 1-3 · foundation + charts + shell',
      timestamp: '2026-07-15T20:41:39Z',
      cumulativeCostUsd: 66.06,
      cumulativeCredits: 280,
      deltaCostUsd: 66.06,
    },
    {
      label: 'final · full app + 6 pages + AI dashboard',
      timestamp: '2026-07-16T03:35:48Z',
      cumulativeCostUsd: 71.99,
      cumulativeCredits: 350,
      deltaCostUsd: 5.93,
    },
    {
      label: 'go-live prep · dataverse-provision skill + runbook',
      timestamp: '2026-07-16T04:14:53Z',
      cumulativeCostUsd: 107.57,
      cumulativeCredits: 460,
      deltaCostUsd: 35.58,
    },
    {
      label: 'go-live · lookups + seed + deploy to dev',
      timestamp: '2026-07-16T15:32:47Z',
      cumulativeCostUsd: 276.13,
      cumulativeCredits: 570,
      deltaCostUsd: 168.57,
    },
    {
      label: 'edit/delete projects + manual-vs-AI comparison',
      timestamp: '2026-07-16T15:47:58Z',
      cumulativeCostUsd: 282.30,
      cumulativeCredits: 590,
      deltaCostUsd: 6.17,
    },
    {
      label: 'enterprise A-E + capacity realism',
      timestamp: '2026-07-16T16:58:04Z',
      cumulativeCostUsd: 351.25,
      cumulativeCredits: 830,
      deltaCostUsd: 68.95,
    },
  ],
  basis:
    'Cache-aware estimate across all build sessions using public list prices (Opus: $15/$75 per 1M in/out, cache write $18.75, cache read $1.50; GPT-5-class: $1.25/$10, cache read $0.125). Credits are GitHub Copilot premium requests (turns x10 for Opus). Wall time includes idle gaps; active generation is real compute time.',
};

export const manualBuildComparison: ManualBuildComparison = {
  internalRateUsd: 75,
  consultantRateUsd: 250,
  tasks: [
    { task: 'Dataverse schema — 3 tables, ~30 columns, 5 lookups, choice sets', hours: 6 },
    { task: 'Sample data entry — 117 records (accounts, resources, projects, assignments)', hours: 5 },
    { task: 'App shell, navigation & theming (3 nav groups, 11 screens)', hours: 6 },
    { task: 'Projects experience — table, search, filters, new/edit/delete + validation', hours: 9 },
    { task: 'Project detail — tasks, dependencies, milestones, health, risks, docs, comments', hours: 12 },
    { task: 'Resources experience — list, detail, forms', hours: 6 },
    { task: 'Assignments experience — junction records & linking', hours: 4 },
    { task: 'Financials — budget/actual/forecast, economics table, charts', hours: 9 },
    { task: 'Capacity — utilization model, roster, over-allocation alerts', hours: 8 },
    { task: 'RAID log — risks/assumptions/issues/dependencies + approval queue', hours: 9 },
    { task: 'Activity feed — filterable portfolio timeline', hours: 5 },
    { task: 'Portfolio dashboard — KPIs, donut & bar charts', hours: 8 },
    { task: 'AI Build Cost dashboard page', hours: 4 },
    { task: 'Required-field metadata / form-rule pattern', hours: 3 },
    { task: 'Styling polish & responsive layout', hours: 6 },
    { task: 'Testing, iteration & bug-fixing', hours: 9 },
  ],
  note:
    'Manual effort is a transparent, line-item estimate for an experienced Power Platform maker building the equivalent app by hand in the UI. Internal rate is a fully-loaded employee cost; consultant rate is a typical external day-rate equivalent. Compared against the actual AI-agent consumption cost captured above.',
};
