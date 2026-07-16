import { Label } from '@fluentui/react-components';
import type { LabelProps } from '@fluentui/react-components';
import { makeStyles, tokens } from '@fluentui/react-components';
import { useDataverseFieldMetadata } from '@/hooks/useDataverseFieldMetadata';

const useStyles = makeStyles({
  required: {
    color: tokens.colorPaletteRedForeground1,
    marginLeft: '2px',
  },
});

type Props = LabelProps & {
  /** Dataverse table logical name (e.g. `pt_project`). Omit for client-only fields. */
  tableLogicalName?: string;
  /** Dataverse column logical name (e.g. `pt_startdate`). Omit for client-only fields. */
  fieldLogicalName?: string;
  /** Display text to use when metadata is not available. */
  fallback?: string;
  /** Force the required indicator for client-only fields not backed by Dataverse. */
  required?: boolean;
};

/**
 * Metadata-backed field label. Renders the Dataverse display name and a required
 * asterisk driven by the column's RequiredLevel — never a hardcoded `*`.
 * See .github/instructions/09-form-field-pattern.instructions.md.
 */
export function DataverseFieldLabel({
  tableLogicalName,
  fieldLogicalName,
  fallback,
  required,
  children,
  ...rest
}: Props) {
  const styles = useStyles();
  const { data } = useDataverseFieldMetadata(tableLogicalName ?? '', fieldLogicalName ?? '');
  const text = data?.displayName ?? fallback ?? children;
  const isRequired = data?.isRequired ?? required ?? false;
  return (
    <Label {...rest}>
      {text}
      {isRequired ? (
        <span aria-hidden="true" className={styles.required}>
          *
        </span>
      ) : null}
    </Label>
  );
}

export function useDataverseFieldRequired(
  tableLogicalName: string | undefined,
  fieldLogicalName: string | undefined,
  fallback?: boolean,
): boolean {
  const { data } = useDataverseFieldMetadata(tableLogicalName ?? '', fieldLogicalName ?? '');
  return data?.isRequired ?? fallback ?? false;
}
