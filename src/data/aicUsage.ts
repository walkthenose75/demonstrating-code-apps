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
  capturedAt: '2026-07-16T04:14:53Z',
  currency: 'USD',
  totals: {
    costUsd: 107.57,
    credits: 460,
    inputTokens: 32171281,
    outputTokens: 309243,
    cacheReadTokens: 30063512,
    cacheWriteTokens: 2042762,
    freshInputTokens: 65007,
    userTurns: 46,
    modelEvents: 287,
  },
  breakdown: {
    freshInputUsd: 0.9751,
    cacheReadUsd: 45.0953,
    cacheWriteUsd: 38.3018,
    outputUsd: 23.1932,
  },
  time: {
    wallSeconds: 39602,
    activeSeconds: 4350,
    firstActivity: '2026-07-15T17:14:51Z',
    lastActivity: '2026-07-16T04:14:53Z',
  },
  models: [
    {
      model: 'claude-opus-4.8',
      vendor: 'Anthropic',
      inputTokens: 32171281,
      freshInputTokens: 65007,
      cacheReadTokens: 30063512,
      cacheWriteTokens: 2042762,
      outputTokens: 309243,
      costUsd: 107.57,
      credits: 460,
      events: 287,
      rates: { input: 15.0, output: 75.0, cacheWrite: 18.75, cacheRead: 1.5, copilotMultiplier: 10 },
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
  ],
  basis:
    'Cache-aware estimate across all 3 build sessions using public Anthropic list prices (Opus: $15/$75 per 1M in/out, cache write $18.75, cache read $1.50). Credits are GitHub Copilot premium requests (turns x10 for Opus). Wall time includes idle gaps; active generation is real compute time.',
};
