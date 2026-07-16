import { makeStyles, tokens, Text, Caption1, Badge } from '@fluentui/react-components';
import {
  DataArea24Regular,
  DataArea24Filled,
  Trophy24Regular,
  Trophy24Filled,
  Box24Regular,
  Box24Filled,
  Warning24Regular,
  Warning24Filled,
  Board24Regular,
  Board24Filled,
  Money24Regular,
  Money24Filled,
} from '@fluentui/react-icons';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: '248px 1fr',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: '18px 12px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 10px 14px',
  },
  logo: {
    display: 'grid',
    placeItems: 'center',
    width: '36px',
    height: '36px',
    borderRadius: tokens.borderRadiusMedium,
    background: 'linear-gradient(135deg, #0f6cbd 0%, #5c2e91 100%)',
    color: '#fff',
    fontWeight: tokens.fontWeightBold,
    fontSize: '18px',
    flexShrink: 0,
  },
  brandText: { display: 'flex', flexDirection: 'column', lineHeight: '1.1' },
  navLabel: {
    color: tokens.colorNeutralForeground4,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '10px 10px 4px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '9px 10px',
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground2,
    textDecoration: 'none',
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightMedium,
    cursor: 'pointer',
    ':hover': { backgroundColor: tokens.colorNeutralBackground1Hover },
  },
  linkActive: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  spacer: { flex: 1 },
  footer: {
    padding: '10px',
    color: tokens.colorNeutralForeground4,
  },
  main: {
    overflowY: 'auto',
    minWidth: 0,
  },
});

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  activeIcon: ReactNode;
}

const items: NavItem[] = [
  { to: '/', label: 'Command Center', icon: <DataArea24Regular />, activeIcon: <DataArea24Filled /> },
  { to: '/projects', label: 'Projects', icon: <Board24Regular />, activeIcon: <Board24Filled /> },
  { to: '/resources', label: 'Resource Library', icon: <Box24Regular />, activeIcon: <Box24Filled /> },
  { to: '/risks', label: 'At-Risk Projects', icon: <Warning24Regular />, activeIcon: <Warning24Filled /> },
  { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy24Regular />, activeIcon: <Trophy24Filled /> },
];

const insightItems: NavItem[] = [
  { to: '/build-cost', label: 'AI Build Cost', icon: <Money24Regular />, activeIcon: <Money24Filled /> },
];

export function AppShell({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>PT</div>
          <div className={styles.brandText}>
            <Text weight="bold" size={400}>
              Project Tracker
            </Text>
            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Portfolio Intelligence</Caption1>
          </div>
        </div>
        <Caption1 className={styles.navLabel}>Workspace</Caption1>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.linkActive}` : styles.link
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? item.activeIcon : item.icon}
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <Caption1 className={styles.navLabel}>Insights</Caption1>
        {insightItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.linkActive}` : styles.link
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? item.activeIcon : item.icon}
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <div className={styles.spacer} />
        <div className={styles.footer}>
          <Badge appearance="tint" color="informative" size="small">
            Prototype · mock data
          </Badge>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
