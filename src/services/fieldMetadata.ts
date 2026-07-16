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
  dat_demodelivery: {
    dat_name: { displayName: 'Delivery Name', requiredLevel: 'system' },
    dat_deliverydate: { displayName: 'Delivery Date', requiredLevel: 'application' },
    dat_solutionarea: { displayName: 'Solution Area', requiredLevel: 'application' },
    dat_customer: { displayName: 'Customer', requiredLevel: 'application' },
    dat_presenter: { displayName: 'Presenter', requiredLevel: 'recommended' },
    dat_deliveryformat: { displayName: 'Delivery Format', requiredLevel: 'none' },
    dat_salesstage: { displayName: 'Sales Stage', requiredLevel: 'none' },
    dat_outcome: { displayName: 'Outcome', requiredLevel: 'none' },
    dat_audiencesize: { displayName: 'Audience Size', requiredLevel: 'none' },
    dat_assetgapreason: { displayName: 'Asset Gap Reason', requiredLevel: 'none' },
  },
  dat_demoasset: {
    dat_name: { displayName: 'Asset Name', requiredLevel: 'system' },
    dat_assettype: { displayName: 'Asset Type', requiredLevel: 'application' },
    dat_solutionarea: { displayName: 'Solution Area', requiredLevel: 'application' },
    dat_maturity: { displayName: 'Maturity', requiredLevel: 'recommended' },
    dat_asseturl: { displayName: 'Asset URL', requiredLevel: 'none' },
    dat_description: { displayName: 'Description', requiredLevel: 'none' },
    dat_maintainer: { displayName: 'Maintainer', requiredLevel: 'recommended' },
  },
  dat_demoassetusage: {
    dat_name: { displayName: 'Usage Name', requiredLevel: 'system' },
    dat_demodelivery: { displayName: 'Demo Delivery', requiredLevel: 'application' },
    dat_demoasset: { displayName: 'Demo Asset', requiredLevel: 'application' },
    dat_usagenote: { displayName: 'Usage Note', requiredLevel: 'none' },
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
