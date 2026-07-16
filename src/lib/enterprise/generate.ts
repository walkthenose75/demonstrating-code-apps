// Deterministic generators for the enterprise surfaces. Everything is seeded from
// a project's stable id (mock string id OR live Dataverse GUID), so the generated
// tasks, milestones, financials, RAID items, activity, etc. are identical on every
// render and in both prototype and connected modes — no extra Dataverse tables.

import type { Project } from '@/types/domain-models';
import { statusSet, outcomeSet, labelOf } from '@/lib/optionSets';
import { leadName } from '@/mockData/reference';
import type {
  Task, Milestone, ProjectHealth, ProjectFinancials, RaidItem, ApprovalGate,
  ActivityEvent, Attachment, Comment, PersonCapacity, HealthStatus, TaskStatus,
} from './model';

/** Financial constants — editable blended billing rate for portfolio economics. */
export const RATES = { blendedUsdPerHour: 135 };

// ── Seeded PRNG (xmur3 hash → mulberry32) ──

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Rng {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(arr: readonly T[]) => T;
  bool: (p?: number) => boolean;
}

function rngFor(seed: string): Rng {
  const gen = mulberry32(xmur3(seed)());
  const next = () => gen();
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    bool: (p = 0.5) => next() < p,
  };
}

// ── Date helpers ──

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isoAtOffsetDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// Assignee / owner pool — mock team member ids resolve to names via reference.ts.
const PEOPLE = ['user-avery', 'user-jordan', 'user-priya', 'user-marcus', 'user-sofia', 'user-liam'];

const TASK_TEMPLATES = [
  'Discovery & requirements', 'Solution design', 'Stakeholder alignment',
  'Build phase 1', 'Build phase 2', 'Integration testing', 'UAT coordination',
  'Data migration', 'Security review', 'Deployment readiness', 'Go-live cutover',
  'Hypercare & handoff', 'Documentation', 'Training delivery', 'Vendor coordination',
];

const MILESTONE_TEMPLATES = [
  'Kickoff complete', 'Requirements sign-off', 'Design approved', 'Build complete',
  'UAT sign-off', 'Go / No-Go gate', 'Go-live', 'Benefits realized',
];

const RISK_TITLES = [
  'Key resource availability at risk', 'Third-party dependency slipping',
  'Scope creep on core module', 'Budget pressure from change requests',
  'Regulatory approval timeline uncertain', 'Data quality below threshold',
  'Integration environment instability', 'Stakeholder alignment gap',
];
const ISSUE_TITLES = [
  'Test environment down', 'Blocking defect in payments flow',
  'Missing source data for migration', 'Access provisioning delayed',
];
const DECISION_TITLES = [
  'Selected cloud region for hosting', 'Deferred phase-2 reporting',
  'Approved additional contractor', 'Adopted phased rollout strategy',
];

function statusToHealth(project: Project, r: Rng): HealthStatus {
  // Off Track only when explicitly at-risk outcome; otherwise weight to green.
  if (project.outcome === 100000002) return r.bool(0.6) ? 'red' : 'amber';
  if (project.riskReason != null) return r.bool(0.5) ? 'amber' : 'green';
  return r.bool(0.75) ? 'green' : 'amber';
}

// ── Task generation ──

export function generateTasks(project: Project): Task[] {
  const r = rngFor(`${project.id}:tasks`);
  const count = r.int(6, 10);
  const done = project.status === 100000003; // Complete
  const tasks: Task[] = [];
  let cursor = project.startDate;
  const usedNames = new Set<string>();
  for (let i = 0; i < count; i += 1) {
    let name = r.pick(TASK_TEMPLATES);
    let guard = 0;
    while (usedNames.has(name) && guard < 10) { name = r.pick(TASK_TEMPLATES); guard += 1; }
    usedNames.add(name);
    const span = r.int(5, 21);
    const startDate = cursor;
    const dueDate = addDays(cursor, span);
    cursor = addDays(cursor, r.int(3, 12));

    const progress = done ? 100 : i < count * 0.4 ? 100 : i < count * 0.6 ? r.int(40, 90) : r.int(0, 35);
    let status: TaskStatus;
    if (progress >= 100) status = 'done';
    else if (progress === 0) status = 'todo';
    else if (r.bool(0.12)) status = 'blocked';
    else status = 'in-progress';

    const estimateHours = r.int(16, 120);
    const loggedHours = Math.round((estimateHours * progress) / 100);
    tasks.push({
      id: `${project.id}-task-${i}`,
      projectId: project.id,
      name,
      assigneeId: r.pick(PEOPLE),
      status,
      percentComplete: progress,
      startDate,
      dueDate,
      estimateHours,
      loggedHours,
      dependsOn: i > 0 && r.bool(0.55) ? `${project.id}-task-${i - 1}` : undefined,
    });
  }
  return tasks;
}

export function generateMilestones(project: Project): Milestone[] {
  const r = rngFor(`${project.id}:milestones`);
  const count = r.int(3, 5);
  const done = project.status === 100000003;
  const items: Milestone[] = [];
  let cursor = project.startDate;
  for (let i = 0; i < count; i += 1) {
    cursor = addDays(cursor, r.int(14, 45));
    const past = new Date(cursor).getTime() < Date.now();
    const status: Milestone['status'] = done || past
      ? (r.bool(0.85) ? 'complete' : 'at-risk')
      : (r.bool(0.2) ? 'at-risk' : 'upcoming');
    items.push({
      id: `${project.id}-ms-${i}`,
      projectId: project.id,
      name: MILESTONE_TEMPLATES[i % MILESTONE_TEMPLATES.length],
      dueDate: cursor,
      status,
      isGate: r.bool(0.4),
    });
  }
  return items;
}

export function projectHealth(project: Project, tasks?: Task[]): ProjectHealth {
  const r = rngFor(`${project.id}:health`);
  const t = tasks ?? generateTasks(project);
  const percentComplete = t.length
    ? Math.round(t.reduce((s, x) => s + x.percentComplete, 0) / t.length)
    : 0;
  const status = statusToHealth(project, r);
  const schedule: HealthStatus = t.some((x) => x.status === 'blocked')
    ? (r.bool(0.5) ? 'red' : 'amber')
    : status;
  const budget: HealthStatus = project.teamSize && project.teamSize > 8
    ? (r.bool(0.5) ? 'amber' : 'green')
    : status === 'red' ? 'amber' : 'green';
  const openRisks = generateRaid(project).filter((x) => x.kind === 'risk' && x.status !== 'closed').length;
  const label = status === 'green' ? 'On Track' : status === 'amber' ? 'At Risk' : 'Off Track';
  return { status, label, percentComplete, schedule, budget, openRisks };
}

export function projectFinancials(project: Project, tasks?: Task[]): ProjectFinancials {
  const r = rngFor(`${project.id}:fin`);
  const t = tasks ?? generateTasks(project);
  const estimateHours = t.reduce((s, x) => s + x.estimateHours, 0);
  const loggedHours = t.reduce((s, x) => s + x.loggedHours, 0);
  const budgetUsd = Math.round((estimateHours * RATES.blendedUsdPerHour * r.int(105, 125)) / 100 / 100) * 100;
  const actualUsd = Math.round((loggedHours * RATES.blendedUsdPerHour) / 100) * 100;
  const pctComplete = estimateHours ? loggedHours / estimateHours : 0;
  // Forecast = actuals + remaining at (possibly inflated) run rate.
  const remainingHours = Math.max(0, estimateHours - loggedHours);
  const overrun = r.int(95, 130) / 100;
  const forecastUsd = Math.round((actualUsd + remainingHours * RATES.blendedUsdPerHour * overrun) / 100) * 100;
  const variancePct = budgetUsd ? Math.round(((forecastUsd - budgetUsd) / budgetUsd) * 100) : 0;
  const status: HealthStatus = variancePct > 10 ? 'red' : variancePct > 3 ? 'amber' : 'green';
  return {
    projectId: project.id,
    projectName: project.name,
    budgetUsd,
    actualUsd: Math.min(actualUsd, forecastUsd),
    forecastUsd,
    estimateHours,
    loggedHours,
    variancePct,
    status: pctComplete === 0 ? 'green' : status,
  };
}

export function generateRaid(project: Project): RaidItem[] {
  const r = rngFor(`${project.id}:raid`);
  const items: RaidItem[] = [];
  const riskCount = r.int(1, 3);
  for (let i = 0; i < riskCount; i += 1) {
    items.push(makeRaid(project, r, 'risk', RISK_TITLES, i));
  }
  if (r.bool(0.5)) items.push(makeRaid(project, r, 'issue', ISSUE_TITLES, riskCount));
  if (r.bool(0.6)) items.push(makeRaid(project, r, 'decision', DECISION_TITLES, riskCount + 1));
  if (r.bool(0.35)) {
    items.push({
      id: `${project.id}-raid-dep-${riskCount + 2}`,
      projectId: project.id,
      projectName: project.name,
      kind: 'dependency',
      title: 'Upstream data feed from platform team',
      severity: r.pick(['low', 'medium', 'high'] as const),
      status: r.pick(['open', 'mitigating'] as const),
      ownerId: r.pick(PEOPLE),
      dueDate: addDays(project.startDate, r.int(20, 90)),
    });
  }
  return items;
}

function makeRaid(project: Project, r: Rng, kind: RaidItem['kind'], titles: readonly string[], idx: number): RaidItem {
  const severity = kind === 'decision'
    ? 'low'
    : r.pick(['low', 'medium', 'high', 'critical'] as const);
  const status: RaidItem['status'] = kind === 'decision'
    ? 'closed'
    : r.pick(['open', 'open', 'mitigating', 'closed'] as const);
  return {
    id: `${project.id}-raid-${kind}-${idx}`,
    projectId: project.id,
    projectName: project.name,
    kind,
    title: r.pick(titles),
    severity,
    status,
    ownerId: r.pick(PEOPLE),
    dueDate: addDays(project.startDate, r.int(15, 100)),
  };
}

export function generateApprovals(project: Project): ApprovalGate[] {
  const gates = generateMilestones(project).filter((m) => m.isGate);
  const r = rngFor(`${project.id}:approvals`);
  return gates.map((g, i) => {
    const past = new Date(g.dueDate).getTime() < Date.now();
    const status = g.status === 'complete'
      ? 'approved'
      : past
        ? (r.bool(0.75) ? 'approved' : 'rejected')
        : 'pending';
    return {
      id: `${project.id}-gate-${i}`,
      projectId: project.id,
      projectName: project.name,
      name: g.name,
      status,
      approverId: r.pick(PEOPLE),
      requestedOn: g.dueDate,
    };
  });
}

export function generateComments(project: Project): Comment[] {
  const r = rngFor(`${project.id}:comments`);
  const bodies = [
    'Confirmed scope with the client — proceeding to build.',
    'Flagging a dependency on the platform team for the data feed.',
    'UAT feedback captured; two minor defects logged.',
    'Budget looking tight after the latest change request.',
    'Great progress this sprint, ahead on the integration work.',
    'Need a decision on hosting region before Friday.',
  ];
  const count = r.int(2, 4);
  const out: Comment[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      id: `${project.id}-cmt-${i}`,
      projectId: project.id,
      authorId: r.pick(PEOPLE),
      body: r.pick(bodies),
      timestamp: isoAtOffsetDays(-r.int(1, 30)),
    });
  }
  return out.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function generateAttachments(project: Project): Attachment[] {
  const r = rngFor(`${project.id}:files`);
  const files: Array<[string, Attachment['kind']]> = [
    ['Project charter.docx', 'doc'],
    ['Budget model.xlsx', 'xls'],
    ['Solution design.pdf', 'pdf'],
    ['Status deck.pptx', 'deck'],
    ['Architecture diagram.png', 'img'],
    ['Risk register.xlsx', 'xls'],
  ];
  const count = r.int(2, 4);
  const out: Attachment[] = [];
  const used = new Set<number>();
  for (let i = 0; i < count; i += 1) {
    let idx = r.int(0, files.length - 1);
    let guard = 0;
    while (used.has(idx) && guard < 10) { idx = r.int(0, files.length - 1); guard += 1; }
    used.add(idx);
    const [name, kind] = files[idx];
    out.push({
      id: `${project.id}-file-${i}`,
      projectId: project.id,
      name,
      kind,
      sizeKb: r.int(120, 8600),
      uploadedById: r.pick(PEOPLE),
      uploadedOn: isoAtOffsetDays(-r.int(2, 60)),
    });
  }
  return out;
}

export function generateActivity(project: Project): ActivityEvent[] {
  const r = rngFor(`${project.id}:activity`);
  const events: ActivityEvent[] = [];
  const statusLabel = labelOf(statusSet, project.status ?? null);
  const outcomeLabel = labelOf(outcomeSet, project.outcome ?? null);
  const push = (kind: ActivityEvent['kind'], message: string, dayOffset: number) => {
    events.push({
      id: `${project.id}-act-${events.length}`,
      projectId: project.id,
      projectName: project.name,
      actorId: r.pick(PEOPLE),
      kind,
      message,
      timestamp: isoAtOffsetDays(-dayOffset),
    });
  };
  push('status', `moved status to ${statusLabel}`, r.int(1, 8));
  push('task', 'completed a task', r.int(1, 12));
  push('file', 'uploaded a document', r.int(2, 16));
  push('milestone', 'reached a milestone', r.int(3, 20));
  if (project.outcome === 100000002) push('status', `flagged outcome as ${outcomeLabel}`, r.int(1, 5));
  if (r.bool(0.6)) push('comment', 'left a comment', r.int(1, 10));
  if (r.bool(0.5)) push('approval', 'requested a stage-gate approval', r.int(2, 14));
  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// ── Portfolio-level aggregators ──

export function portfolioFinancials(projects: Project[]): ProjectFinancials[] {
  return projects.map((p) => projectFinancials(p));
}

export function raidLog(projects: Project[]): RaidItem[] {
  return projects.flatMap((p) => generateRaid(p));
}

export function approvalsQueue(projects: Project[]): ApprovalGate[] {
  return projects.flatMap((p) => generateApprovals(p));
}

export function activityFeed(projects: Project[]): ActivityEvent[] {
  return projects
    .flatMap((p) => generateActivity(p))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * People capacity derived from project leadership. Each distinct project lead is
 * loaded by the teamSize of the projects they lead; capacity is a flat baseline.
 * Works in mock (ids) and live (display names) — leads are grouped by their raw value.
 */
export function capacityByPerson(projects: Project[]): PersonCapacity[] {
  const CAPACITY_HOURS = 160; // per person / month baseline
  const byLead = new Map<string, Project[]>();
  for (const p of projects) {
    const lead = p.projectLead;
    if (!lead) continue;
    const list = byLead.get(lead) ?? [];
    list.push(p);
    byLead.set(lead, list);
  }
  const out: PersonCapacity[] = [];
  for (const [lead, list] of byLead) {
    const r = rngFor(`cap:${lead}`);
    // Only active (not complete) projects consume current capacity.
    const active = list.filter((p) => p.status !== 100000003);
    const allocatedHours = active.reduce(
      (s, p) => s + (p.teamSize ?? 3) * r.int(6, 12),
      0,
    );
    const allocationPct = Math.round((allocatedHours / CAPACITY_HOURS) * 100);
    const status = allocationPct > 100 ? 'over' : allocationPct >= 70 ? 'balanced' : 'available';
    out.push({
      personId: lead,
      name: leadName(lead),
      title: 'Project Lead',
      initials: leadName(lead).split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
      activeProjects: active.length,
      allocatedHours,
      capacityHours: CAPACITY_HOURS,
      allocationPct,
      status,
    });
  }
  return out.sort((a, b) => b.allocationPct - a.allocationPct);
}
