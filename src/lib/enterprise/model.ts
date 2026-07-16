// Enterprise capability model — types for the execution, financials, capacity,
// RAID/governance, and collaboration surfaces. These are derived deterministically
// from the existing Project / Resource / Assignment data (see generate.ts), so the
// same code produces stable data in both prototype (mock) and connected (Dataverse)
// modes with zero additional provisioning.

export type HealthStatus = 'green' | 'amber' | 'red';

export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done';

export interface Task {
  id: string;
  projectId: string;
  name: string;
  assigneeId: string;
  status: TaskStatus;
  percentComplete: number; // 0..100
  startDate: string;
  dueDate: string;
  estimateHours: number;
  loggedHours: number;
  /** Predecessor task id, if this task depends on another. */
  dependsOn?: string;
}

export type MilestoneStatus = 'upcoming' | 'at-risk' | 'complete';

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  dueDate: string;
  status: MilestoneStatus;
  /** Stage gate requiring formal approval to pass. */
  isGate: boolean;
}

export interface ProjectHealth {
  status: HealthStatus;
  label: string; // 'On Track' | 'At Risk' | 'Off Track'
  percentComplete: number; // rollup across tasks
  schedule: HealthStatus;
  budget: HealthStatus;
  openRisks: number;
}

export interface ProjectFinancials {
  projectId: string;
  projectName: string;
  budgetUsd: number;
  actualUsd: number;
  forecastUsd: number;
  estimateHours: number;
  loggedHours: number;
  variancePct: number; // (forecast - budget) / budget
  status: HealthStatus;
}

export type RaidKind = 'risk' | 'issue' | 'decision' | 'dependency';
export type RaidSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RaidStatus = 'open' | 'mitigating' | 'closed';

export interface RaidItem {
  id: string;
  projectId: string;
  projectName: string;
  kind: RaidKind;
  title: string;
  severity: RaidSeverity;
  status: RaidStatus;
  ownerId: string;
  dueDate: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalGate {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  status: ApprovalStatus;
  approverId: string;
  requestedOn: string;
}

export type ActivityKind = 'comment' | 'status' | 'task' | 'file' | 'milestone' | 'approval';

export interface ActivityEvent {
  id: string;
  projectId: string;
  projectName: string;
  actorId: string;
  kind: ActivityKind;
  message: string;
  timestamp: string;
}

export type AttachmentKind = 'doc' | 'xls' | 'pdf' | 'img' | 'deck';

export interface Attachment {
  id: string;
  projectId: string;
  name: string;
  kind: AttachmentKind;
  sizeKb: number;
  uploadedById: string;
  uploadedOn: string;
}

export interface Comment {
  id: string;
  projectId: string;
  authorId: string;
  body: string;
  timestamp: string;
}

export type CapacityStatus = 'available' | 'balanced' | 'over';

export interface PersonCapacity {
  personId: string;
  name: string;
  title: string;
  initials: string;
  activeProjects: number;
  allocatedHours: number;
  capacityHours: number;
  allocationPct: number;
  status: CapacityStatus;
}

// ── Shared presentation helpers ──

export function healthColor(status: HealthStatus): string {
  return status === 'green' ? '#107c10' : status === 'amber' ? '#ca5010' : '#c50f1f';
}

export function healthLabel(status: HealthStatus): string {
  return status === 'green' ? 'On Track' : status === 'amber' ? 'At Risk' : 'Off Track';
}

export function severityColor(severity: RaidSeverity): string {
  switch (severity) {
    case 'critical': return '#c50f1f';
    case 'high': return '#ca5010';
    case 'medium': return '#c19c00';
    default: return '#616161';
  }
}

export function capacityColor(status: CapacityStatus): string {
  return status === 'over' ? '#c50f1f' : status === 'balanced' ? '#0f6cbd' : '#107c10';
}
