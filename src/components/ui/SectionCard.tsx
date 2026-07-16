import { makeStyles, tokens, Subtitle2, mergeClasses } from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow2,
    overflow: 'hidden',
    minWidth: 0,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  titleWrap: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  subtitle: { color: tokens.colorNeutralForeground3 },
  body: {
    padding: '20px',
    minWidth: 0,
  },
  flush: { padding: 0 },
});

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
  className?: string;
}

export function SectionCard({ title, subtitle, action, children, flush, className }: Props) {
  const styles = useStyles();
  return (
    <section className={mergeClasses(styles.card, className)}>
      <div className={styles.head}>
        <div className={styles.titleWrap}>
          <Subtitle2>{title}</Subtitle2>
          {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
        </div>
        {action}
      </div>
      <div className={mergeClasses(styles.body, flush && styles.flush)}>{children}</div>
    </section>
  );
}
