import { makeStyles, tokens, mergeClasses } from '@fluentui/react-components';
import type { OptionSet } from '@/lib/optionSets';
import { optionOf } from '@/lib/optionSets';

const useStyles = makeStyles({
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: tokens.borderRadiusCircular,
    paddingLeft: '10px',
    paddingRight: '10px',
    paddingTop: '3px',
    paddingBottom: '3px',
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: '16px',
    whiteSpace: 'nowrap',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: tokens.borderRadiusCircular,
    flexShrink: 0,
  },
  plain: {
    color: tokens.colorNeutralForeground3,
  },
});

interface Props {
  set: OptionSet;
  value: number | undefined | null;
  className?: string;
}

/** A colored chip for any option-set value. Uses the option's hex accent. */
export function OptionBadge({ set, value, className }: Props) {
  const styles = useStyles();
  const opt = optionOf(set, value);
  if (!opt) return <span className={mergeClasses(styles.chip, styles.plain, className)}>—</span>;
  return (
    <span
      className={mergeClasses(styles.chip, className)}
      style={{ backgroundColor: `${opt.color}14`, color: opt.color, borderColor: `${opt.color}33` }}
      title={opt.label}
    >
      <span className={styles.dot} style={{ backgroundColor: opt.color }} />
      {opt.short ?? opt.label}
    </span>
  );
}
