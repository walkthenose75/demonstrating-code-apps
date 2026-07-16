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

export const solutionAreaSet: OptionSet = {
  logicalName: 'dat_solutionarea',
  displayName: 'Solution Area',
  options: [
    { value: 100000000, label: 'Azure Infrastructure', color: '#0f6cbd', short: 'Azure' },
    { value: 100000001, label: 'Data & AI', color: '#8764b8', short: 'Data & AI' },
    { value: 100000002, label: 'Security', color: '#c50f1f', short: 'Security' },
    { value: 100000003, label: 'Modern Work', color: '#107c10', short: 'Modern Work' },
    { value: 100000004, label: 'Business Applications', color: '#ca5010', short: 'Biz Apps' },
    { value: 100000005, label: 'Copilot', color: '#5c2e91', short: 'Copilot' },
    { value: 100000006, label: 'Other', color: '#616161', short: 'Other' },
  ],
};

export const deliveryFormatSet: OptionSet = {
  logicalName: 'dat_deliveryformat',
  displayName: 'Delivery Format',
  options: [
    { value: 100000000, label: 'In-person', color: '#0f6cbd' },
    { value: 100000001, label: 'Remote', color: '#8764b8' },
    { value: 100000002, label: 'Event / Booth', color: '#ca5010' },
    { value: 100000003, label: 'Hybrid', color: '#107c10' },
  ],
};

export const salesStageSet: OptionSet = {
  logicalName: 'dat_deliverystage',
  displayName: 'Sales Stage',
  options: [
    { value: 100000000, label: 'Discovery', color: '#616161' },
    { value: 100000001, label: 'Technical Validation', color: '#0f6cbd' },
    { value: 100000002, label: 'Proof of Concept', color: '#8764b8' },
    { value: 100000003, label: 'Executive Briefing', color: '#107c10' },
  ],
};

export const outcomeSet: OptionSet = {
  logicalName: 'dat_outcome',
  displayName: 'Outcome',
  options: [
    { value: 100000000, label: 'Advanced Opportunity', color: '#107c10' },
    { value: 100000001, label: 'Neutral', color: '#616161' },
    { value: 100000002, label: 'Stalled', color: '#c50f1f' },
    { value: 100000003, label: 'Won Technical Decision', color: '#0f6cbd' },
  ],
};

export const assetTypeSet: OptionSet = {
  logicalName: 'dat_assettype',
  displayName: 'Asset Type',
  options: [
    { value: 100000000, label: 'GitHub Repo', color: '#24292f' },
    { value: 100000001, label: 'Deployed Sandbox', color: '#0f6cbd' },
    { value: 100000002, label: 'Script / Runbook', color: '#8764b8' },
    { value: 100000003, label: 'Recorded Video', color: '#c50f1f' },
    { value: 100000004, label: 'Interactive Sandbox', color: '#107c10' },
    { value: 100000005, label: 'Slide-embedded', color: '#ca5010' },
  ],
};

export const maturitySet: OptionSet = {
  logicalName: 'dat_maturity',
  displayName: 'Maturity',
  options: [
    { value: 100000000, label: 'Draft', color: '#616161' },
    { value: 100000001, label: 'Field-ready', color: '#0f6cbd' },
    { value: 100000002, label: 'Certified (Gold)', color: '#c19c00' },
    { value: 100000003, label: 'Deprecated', color: '#c50f1f' },
  ],
};

export const assetGapReasonSet: OptionSet = {
  logicalName: 'dat_assetgapreason',
  displayName: 'Asset Gap Reason',
  options: [
    { value: 100000000, label: 'Not Yet Built', color: '#ca5010' },
    { value: 100000001, label: 'Not Assetizable / Confidential', color: '#616161' },
    { value: 100000002, label: 'One-off', color: '#8764b8' },
    { value: 100000003, label: 'Used Partner Asset', color: '#0f6cbd' },
  ],
};

const lookups: Record<string, Map<number, OptionSetOption>> = {
  [solutionAreaSet.logicalName]: makeLookup(solutionAreaSet),
  [deliveryFormatSet.logicalName]: makeLookup(deliveryFormatSet),
  [salesStageSet.logicalName]: makeLookup(salesStageSet),
  [outcomeSet.logicalName]: makeLookup(outcomeSet),
  [assetTypeSet.logicalName]: makeLookup(assetTypeSet),
  [maturitySet.logicalName]: makeLookup(maturitySet),
  [assetGapReasonSet.logicalName]: makeLookup(assetGapReasonSet),
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
