import type { AppDataProvider } from '@/services/data-contracts';
import { getFieldMetadata } from '@/services/field-metadata-cache';
import type { Project } from '@/types/domain-models';
import type { Resource } from '@/types/domain-models';
import type { Assignment } from '@/types/domain-models';
import { Pt_projectsService } from '@/generated/services/Pt_projectsService';
import { Pt_resourcesService } from '@/generated/services/Pt_resourcesService';
import { Pt_assignmentsService } from '@/generated/services/Pt_assignmentsService';
import type { Pt_projects, Pt_projectsBase } from '@/generated/models/Pt_projectsModel';
import type { Pt_resources, Pt_resourcesBase } from '@/generated/models/Pt_resourcesModel';
import type { Pt_assignments, Pt_assignmentsBase } from '@/generated/models/Pt_assignmentsModel';

// Adapts the read-only generated Dataverse services (src/generated/**) into the
// UI-facing domain contract (src/types/domain-models.ts). Components and hooks
// only ever see Project/Resource/Assignment — never the pt_* connector shape.
//
// Enabled when VITE_USE_MOCK=false (see providerFactory.ts). Lookup columns
// (pt_client, pt_projectlead, pt_owner, pt_project, pt_resource) are read
// defensively from the Dataverse @odata `_<name>_value` fields so this file
// keeps compiling before those relationships are provisioned; writing lookups
// via @odata.bind is added alongside the relationships.

function optional<T>(value: T | null | undefined): T | undefined {
  return value === null || value === undefined ? undefined : value;
}

function lookupValue(record: object, field: string): string | undefined {
  const raw = (record as Record<string, unknown>)[`_${field}_value`];
  return raw === undefined || raw === null ? undefined : String(raw);
}

// ── Project ──────────────────────────────────────────────────────────────

export function mapProjectFromConnector(record: Pt_projects): Project {
  return {
    id: record.pt_projectid,
    name: record.pt_projectname ?? '',
    startDate: record.pt_startdate ?? '',
    client: lookupValue(record, 'pt_client'),
    projectLead: lookupValue(record, 'pt_projectlead'),
    practiceArea: Number(record.pt_practicearea ?? 0),
    projectType: record.pt_projecttype !== undefined ? Number(record.pt_projecttype) : undefined,
    status: record.pt_status !== undefined ? Number(record.pt_status) : undefined,
    outcome: record.pt_outcome !== undefined ? Number(record.pt_outcome) : undefined,
    teamSize: record.pt_teamsize !== undefined ? Number(record.pt_teamsize) : undefined,
    riskReason: record.pt_riskreason !== undefined ? Number(record.pt_riskreason) : undefined,
    resourceCount: record.pt_resourcecount !== undefined ? Number(record.pt_resourcecount) : undefined,
  };
}

export function mapProjectToConnector(input: Partial<Project>): Record<string, unknown> {
  return {
    ...(input.name !== undefined ? { pt_projectname: input.name } : {}),
    ...(input.startDate !== undefined ? { pt_startdate: input.startDate } : {}),
    ...(input.practiceArea !== undefined ? { pt_practicearea: input.practiceArea } : {}),
    ...(input.projectType !== undefined ? { pt_projecttype: input.projectType } : {}),
    ...(input.status !== undefined ? { pt_status: input.status } : {}),
    ...(input.outcome !== undefined ? { pt_outcome: input.outcome } : {}),
    ...(input.teamSize !== undefined ? { pt_teamsize: input.teamSize } : {}),
    ...(input.riskReason !== undefined ? { pt_riskreason: input.riskReason } : {}),
    ...(input.resourceCount !== undefined ? { pt_resourcecount: input.resourceCount } : {}),
  };
}

// ── Resource ─────────────────────────────────────────────────────────────

export function mapResourceFromConnector(record: Pt_resources): Resource {
  return {
    id: record.pt_resourceid,
    name: record.pt_resourcename ?? '',
    resourceType: Number(record.pt_resourcetype ?? 0),
    practiceArea: Number(record.pt_practicearea ?? 0),
    maturity: record.pt_maturity !== undefined ? Number(record.pt_maturity) : undefined,
    resourceUrl: optional(record.pt_resourceurl),
    description: optional(record.pt_description),
    owner: lookupValue(record, 'pt_owner'),
    usageCount: record.pt_usagecount !== undefined ? Number(record.pt_usagecount) : undefined,
    lastUsedOn: optional(record.pt_lastusedon),
  };
}

export function mapResourceToConnector(input: Partial<Resource>): Record<string, unknown> {
  return {
    ...(input.name !== undefined ? { pt_resourcename: input.name } : {}),
    ...(input.resourceType !== undefined ? { pt_resourcetype: input.resourceType } : {}),
    ...(input.practiceArea !== undefined ? { pt_practicearea: input.practiceArea } : {}),
    ...(input.maturity !== undefined ? { pt_maturity: input.maturity } : {}),
    ...(input.resourceUrl !== undefined ? { pt_resourceurl: input.resourceUrl } : {}),
    ...(input.description !== undefined ? { pt_description: input.description } : {}),
    ...(input.usageCount !== undefined ? { pt_usagecount: input.usageCount } : {}),
    ...(input.lastUsedOn !== undefined ? { pt_lastusedon: input.lastUsedOn } : {}),
  };
}

// ── Assignment (junction) ─────────────────────────────────────────────────

export function mapAssignmentFromConnector(record: Pt_assignments): Assignment {
  return {
    id: record.pt_assignmentid,
    name: record.pt_assignmentname ?? '',
    project: lookupValue(record, 'pt_project') ?? '',
    resource: lookupValue(record, 'pt_resource') ?? '',
    assignmentNote: optional(record.pt_assignmentnote),
  };
}

export function mapAssignmentToConnector(input: Partial<Assignment>): Record<string, unknown> {
  return {
    ...(input.name !== undefined ? { pt_assignmentname: input.name } : {}),
    ...(input.assignmentNote !== undefined ? { pt_assignmentnote: input.assignmentNote } : {}),
    // pt_project / pt_resource are lookups written via @odata.bind once the
    // relationships are provisioned.
  };
}

// ── Provider ──────────────────────────────────────────────────────────────

export function createRealDataProvider(): AppDataProvider {
  return {
    projects: {
      async list() {
        const result = await Pt_projectsService.getAll();
        return (result.data ?? []).map(mapProjectFromConnector);
      },
      async getById(id: string) {
        const result = await Pt_projectsService.get(id);
        return result.data ? mapProjectFromConnector(result.data) : null;
      },
      async save(input: Partial<Project>) {
        const payload = mapProjectToConnector(input);
        const result = input.id
          ? await Pt_projectsService.update(input.id, payload as Partial<Omit<Pt_projectsBase, 'pt_projectid'>>)
          : await Pt_projectsService.create(payload as unknown as Omit<Pt_projectsBase, 'pt_projectid'>);
        return mapProjectFromConnector(result.data as Pt_projects);
      },
    },
    resources: {
      async list() {
        const result = await Pt_resourcesService.getAll();
        return (result.data ?? []).map(mapResourceFromConnector);
      },
      async getById(id: string) {
        const result = await Pt_resourcesService.get(id);
        return result.data ? mapResourceFromConnector(result.data) : null;
      },
      async save(input: Partial<Resource>) {
        const payload = mapResourceToConnector(input);
        const result = input.id
          ? await Pt_resourcesService.update(input.id, payload as Partial<Omit<Pt_resourcesBase, 'pt_resourceid'>>)
          : await Pt_resourcesService.create(payload as unknown as Omit<Pt_resourcesBase, 'pt_resourceid'>);
        return mapResourceFromConnector(result.data as Pt_resources);
      },
    },
    assignments: {
      async list() {
        const result = await Pt_assignmentsService.getAll();
        return (result.data ?? []).map(mapAssignmentFromConnector);
      },
      async getById(id: string) {
        const result = await Pt_assignmentsService.get(id);
        return result.data ? mapAssignmentFromConnector(result.data) : null;
      },
      async save(input: Partial<Assignment>) {
        const payload = mapAssignmentToConnector(input);
        const result = input.id
          ? await Pt_assignmentsService.update(input.id, payload as Partial<Omit<Pt_assignmentsBase, 'pt_assignmentid'>>)
          : await Pt_assignmentsService.create(payload as unknown as Omit<Pt_assignmentsBase, 'pt_assignmentid'>);
        return mapAssignmentFromConnector(result.data as Pt_assignments);
      },
    },
    fieldMetadata: { getField: getFieldMetadata },
  } satisfies AppDataProvider;
}
