import { makeStyles, tokens, Title3, Body1, mergeClasses } from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
    padding: '28px 32px 20px',
  },
  hero: {
    background: 'linear-gradient(120deg, #0f2b46 0%, #0f6cbd 55%, #5c2e91 100%)',
    color: '#fff',
    borderRadius: 0,
  },
  titleWrap: { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 },
  subtitle: { color: tokens.colorNeutralForeground3 },
  subtitleHero: { color: 'rgba(255,255,255,0.82)' },
  titleHero: { color: '#fff' },
  actions: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
});

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  hero?: boolean;
}

export function PageHeader({ title, subtitle, actions, hero }: Props) {
  const styles = useStyles();
  return (
    <div className={mergeClasses(styles.header, hero && styles.hero)}>
      <div className={styles.titleWrap}>
        <Title3 as="h1" className={hero ? styles.titleHero : undefined}>{title}</Title3>
        {subtitle ? (
          <Body1 className={hero ? styles.subtitleHero : styles.subtitle}>{subtitle}</Body1>
        ) : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}
