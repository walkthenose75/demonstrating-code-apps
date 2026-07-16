// Field metadata source for the DataverseFieldLabel pattern
// (see .github/instructions/09-form-field-pattern.instructions.md).
//
// In connected mode this would call <GeneratedService>.getMetadata() per table.
// In prototype mode we mirror the RequiredLevel declared in
// dataverse/planning-payload.json via a static registry, so required-field
// asterisks render correctly without hardcoding `*` at any call site.

export type DataverseFieldRequiredLevel = 'none' | 'recommended' | 'application' | 'system';

export interface DataverseFieldMetadata {
  tableLogicalName: string;
  fieldLogicalName: string;
  displayName?: string;
  requiredLevel: DataverseFieldRequiredLevel;
  isRequired: boolean;
}

export interface FieldMetadataRepository {
  getField(tableLogicalName: string, fieldLogicalName: string): Promise<DataverseFieldMetadata | null>;
}

const BY_VALUE: Record<number, DataverseFieldRequiredLevel> = {
  0: 'none',
  1: 'system',
  2: 'application',
  3: 'recommended',
};
const BY_NAME: Record<string, DataverseFieldRequiredLevel> = {
  none: 'none',
  systemrequired: 'system',
  applicationrequired: 'application',
  recommended: 'recommended',
};

// The Power Apps SDK returns RequiredLevel.Value as a STRING name (not numeric).
// Accept both shapes so live metadata maps correctly. See 09 instructions.
export function mapRequiredLevel(value: unknown): DataverseFieldRequiredLevel {
  if (typeof value === 'number' && value in BY_VALUE) return BY_VALUE[value];
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n) && n in BY_VALUE) return BY_VALUE[n];
    const k = value.trim().toLowerCase();
    if (k in BY_NAME) return BY_NAME[k];
  }
  return 'none';
}

interface FieldSeed {
  displayName: string;
  requiredLevel: DataverseFieldRequiredLevel;
}

// Keyed by table logical name → field logical name. Mirrors the RequiredLevel
// in dataverse/planning-payload.json for the three custom tables.
const registry: Record<string, Record<string, FieldSeed>> = {
  pt_project: {
    pt_name: { displayName: 'Project Name', requiredLevel: 'system' },
    pt_startdate: { displayName: 'Start Date', requiredLevel: 'application' },
    pt_practicearea: { displayName: 'Practice Area', requiredLevel: 'application' },
    pt_client: { displayName: 'Client', requiredLevel: 'application' },
    pt_projectlead: { displayName: 'Project Lead', requiredLevel: 'recommended' },
    pt_projecttype: { displayName: 'Project Type', requiredLevel: 'none' },
    pt_status: { displayName: 'Status', requiredLevel: 'none' },
    pt_outcome: { displayName: 'Outcome', requiredLevel: 'none' },
    pt_teamsize: { displayName: 'Team Size', requiredLevel: 'none' },
    pt_riskreason: { displayName: 'Risk Reason', requiredLevel: 'none' },
  },
  pt_resource: {
    pt_name: { displayName: 'Resource Name', requiredLevel: 'system' },
    pt_resourcetype: { displayName: 'Resource Type', requiredLevel: 'application' },
    pt_practicearea: { displayName: 'Practice Area', requiredLevel: 'application' },
    pt_maturity: { displayName: 'Maturity', requiredLevel: 'recommended' },
    pt_resourceurl: { displayName: 'Resource URL', requiredLevel: 'none' },
    pt_description: { displayName: 'Description', requiredLevel: 'none' },
    pt_owner: { displayName: 'Owner', requiredLevel: 'recommended' },
  },
  pt_assignment: {
    pt_name: { displayName: 'Assignment Name', requiredLevel: 'system' },
    pt_project: { displayName: 'Project', requiredLevel: 'application' },
    pt_resource: { displayName: 'Resource', requiredLevel: 'application' },
    pt_assignmentnote: { displayName: 'Assignment Note', requiredLevel: 'none' },
  },
};

export function createFieldMetadataRepository(): FieldMetadataRepository {
  return {
    async getField(tableLogicalName, fieldLogicalName) {
      const seed = registry[tableLogicalName]?.[fieldLogicalName];
      if (!seed) return null;
      const requiredLevel = seed.requiredLevel;
      return {
        tableLogicalName,
        fieldLogicalName,
        displayName: seed.displayName,
        requiredLevel,
        isRequired: requiredLevel === 'application' || requiredLevel === 'system',
      };
    },
  };
}

export const fieldMetadataRepository = createFieldMetadataRepository();
