// Edit dataverse/planning-payload.json, then rerun npm run prototype:seed to refresh mock data.
// Domain models for the Project Tracker. The same three-table many-to-many
// structure works for med-tech, pharma, and general-business portfolios:
//   Project (user-owned) ── Assignment (junction) ── Resource (org-owned library)

export interface Project {
  id: string;
  name: string;
  startDate: string;
  client?: string;
  projectLead?: string;
  practiceArea: number;
  projectType?: number;
  status?: number;
  outcome?: number;
  teamSize?: number;
  riskReason?: number;
  resourceCount?: number;
}

export interface Resource {
  id: string;
  name: string;
  resourceType: number;
  practiceArea: number;
  maturity?: number;
  resourceUrl?: string;
  description?: string;
  owner?: string;
  usageCount?: number;
  lastUsedOn?: string;
}

export interface Assignment {
  id: string;
  name: string;
  project: string;
  resource: string;
  assignmentNote?: string;
}
