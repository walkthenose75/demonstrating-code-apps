// Domain option sets — the app-side mirror of the Dataverse global choice sets
// defined in dataverse/planning-payload.json. In connected mode these labels come
// from option-set metadata; here they back the prototype. Values match the
// publisher choice-value prefix convention (100000000+).

export interface OptionSetOption {
  value: number;
  label: string;
  /** Hex accent used for badges and chart segments. */
  color: string;
  /** Optional short code for compact chips. */
  short?: string;
}

export interface OptionSet {
  logicalName: string;
  displayName: string;
  options: OptionSetOption[];
}

function makeLookup(set: OptionSet) {
  const byValue = new Map<number, OptionSetOption>();
  for (const option of set.options) byValue.set(option.value, option);
  return byValue;
}

export const practiceAreaSet: OptionSet = {
  logicalName: 'pt_practicearea',
  displayName: 'Practice Area',
  options: [
    { value: 100000000, label: 'Product Development', color: '#0f6cbd', short: 'Product' },
    { value: 100000001, label: 'Regulatory & Compliance', color: '#c50f1f', short: 'Regulatory' },
    { value: 100000002, label: 'Clinical & Quality', color: '#107c10', short: 'Clinical' },
    { value: 100000003, label: 'Manufacturing & Supply', color: '#ca5010', short: 'Manufacturing' },
    { value: 100000004, label: 'Commercial', color: '#8764b8', short: 'Commercial' },
    { value: 100000005, label: 'IT & Digital', color: '#5c2e91', short: 'IT & Digital' },
    { value: 100000006, label: 'Operations', color: '#616161', short: 'Operations' },
  ],
};

export const projectTypeSet: OptionSet = {
  logicalName: 'pt_projecttype',
  displayName: 'Project Type',
  options: [
    { value: 100000000, label: 'Internal Initiative', color: '#0f6cbd' },
    { value: 100000001, label: 'Client Engagement', color: '#8764b8' },
    { value: 100000002, label: 'Research Study', color: '#107c10' },
    { value: 100000003, label: 'Compliance Program', color: '#ca5010' },
  ],
};

export const statusSet: OptionSet = {
  logicalName: 'pt_status',
  displayName: 'Status',
  options: [
    { value: 100000000, label: 'Planning', color: '#616161' },
    { value: 100000001, label: 'In Progress', color: '#0f6cbd' },
    { value: 100000002, label: 'In Review', color: '#8764b8' },
    { value: 100000003, label: 'Complete', color: '#107c10' },
  ],
};

export const outcomeSet: OptionSet = {
  logicalName: 'pt_outcome',
  displayName: 'Outcome',
  options: [
    { value: 100000000, label: 'On Track', color: '#107c10' },
    { value: 100000001, label: 'Monitoring', color: '#616161' },
    { value: 100000002, label: 'At Risk', color: '#c50f1f' },
    { value: 100000003, label: 'Delivered', color: '#0f6cbd' },
  ],
};

export const resourceTypeSet: OptionSet = {
  logicalName: 'pt_resourcetype',
  displayName: 'Resource Type',
  options: [
    { value: 100000000, label: 'Document / Template', color: '#24292f' },
    { value: 100000001, label: 'Dataset', color: '#0f6cbd' },
    { value: 100000002, label: 'Tool / System', color: '#8764b8' },
    { value: 100000003, label: 'Playbook / SOP', color: '#c50f1f' },
    { value: 100000004, label: 'Environment / Sandbox', color: '#107c10' },
    { value: 100000005, label: 'Reference Material', color: '#ca5010' },
  ],
};

export const maturitySet: OptionSet = {
  logicalName: 'pt_maturity',
  displayName: 'Maturity',
  options: [
    { value: 100000000, label: 'Draft', color: '#616161' },
    { value: 100000001, label: 'Ready', color: '#0f6cbd' },
    { value: 100000002, label: 'Approved (Gold)', color: '#c19c00' },
    { value: 100000003, label: 'Retired', color: '#c50f1f' },
  ],
};

export const riskReasonSet: OptionSet = {
  logicalName: 'pt_riskreason',
  displayName: 'Risk Reason',
  options: [
    { value: 100000000, label: 'Not Yet Resourced', color: '#ca5010' },
    { value: 100000001, label: 'Confidential / Restricted', color: '#616161' },
    { value: 100000002, label: 'One-off Effort', color: '#8764b8' },
    { value: 100000003, label: 'Using External Vendor', color: '#0f6cbd' },
  ],
};

const lookups: Record<string, Map<number, OptionSetOption>> = {
  [practiceAreaSet.logicalName]: makeLookup(practiceAreaSet),
  [projectTypeSet.logicalName]: makeLookup(projectTypeSet),
  [statusSet.logicalName]: makeLookup(statusSet),
  [outcomeSet.logicalName]: makeLookup(outcomeSet),
  [resourceTypeSet.logicalName]: makeLookup(resourceTypeSet),
  [maturitySet.logicalName]: makeLookup(maturitySet),
  [riskReasonSet.logicalName]: makeLookup(riskReasonSet),
};

export function optionOf(set: OptionSet, value: number | undefined | null): OptionSetOption | undefined {
  if (value === undefined || value === null) return undefined;
  return lookups[set.logicalName]?.get(value);
}

export function labelOf(set: OptionSet, value: number | undefined | null): string {
  return optionOf(set, value)?.label ?? '—';
}

export function colorOf(set: OptionSet, value: number | undefined | null): string {
  return optionOf(set, value)?.color ?? '#616161';
}
