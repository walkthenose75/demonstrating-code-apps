import { makeStyles, tokens, Caption1, mergeClasses } from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '18px 20px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow2,
    minWidth: 0,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  label: {
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    fontWeight: tokens.fontWeightSemibold,
  },
  value: {
    fontSize: '30px',
    lineHeight: '34px',
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
  },
  accent: {
    height: '3px',
    borderRadius: tokens.borderRadiusCircular,
    marginTop: '10px',
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
});

interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accentColor?: string;
  className?: string;
}

export function StatCard({ label, value, hint, icon, accentColor, className }: Props) {
  const styles = useStyles();
  return (
    <div className={mergeClasses(styles.card, className)}>
      <div className={styles.head}>
        <Caption1 className={styles.label}>{label}</Caption1>
        {icon}
      </div>
      <div className={styles.value}>{value}</div>
      {hint ? <Caption1 className={styles.hint}>{hint}</Caption1> : null}
      {accentColor ? <div className={styles.accent} style={{ backgroundColor: accentColor }} /> : null}
    </div>
  );
}
