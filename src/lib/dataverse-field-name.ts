// Maps a domain-model key to its Dataverse logical column name.
// Convention: <publisherPrefix>_ + key.toLowerCase(). Pass an explicit
// logical name only for out-of-convention columns (e.g. OOTB attributes).
// See .github/instructions/09-form-field-pattern.instructions.md.

export const PUBLISHER_PREFIX = 'pt';

export function toDataverseFieldName(key: string, explicitLogicalName?: string): string {
  if (explicitLogicalName) return explicitLogicalName;
  return `${PUBLISHER_PREFIX}_${key.toLowerCase()}`;
}
