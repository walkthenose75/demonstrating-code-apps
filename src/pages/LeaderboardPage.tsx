import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody, Badge, Text, Caption1 } from '@fluentui/react-components';
import { Link } from 'react-router-dom';
import { useCoverageAnalytics } from '@/hooks/useCoverageAnalytics';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { CoverageBar } from '@/components/ui/CoverageBar';
import { LeadAvatar } from '@/components/ui/LeadAvatar';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' },
  body: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 32px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: tokens.fontSizeBase300 },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: tokens.fontSizeBase200,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
  },
  td: { padding: '12px 14px', borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, verticalAlign: 'middle' },
  num: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  rank: { fontWeight: tokens.fontWeightBold, color: tokens.colorNeutralForeground3, width: '40px' },
  who: { display: 'flex', alignItems: 'center', gap: '10px' },
  covCell: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px' },
  covPct: { fontVariantNumeric: 'tabular-nums', fontWeight: tokens.fontWeightSemibold, width: '40px', textAlign: 'right' },
  link: { color: tokens.colorBrandForeground1, textDecoration: 'none', fontWeight: tokens.fontWeightSemibold, ':hover': { textDecoration: 'underline' } },
  center: { display: 'grid', placeItems: 'center', padding: '48px' },
});

function medal(rank: number): string {
  return rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
}

export function LeaderboardPage() {
  const styles = useStyles();
  const { isLoading, isError, leads, topResources } = useCoverageAnalytics();

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner label="Loading leaderboard…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.body} style={{ paddingTop: 24 }}>
        <MessageBar intent="error">
          <MessageBarBody>Unable to load the leaderboard. Please try again.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader title="Leaderboard" subtitle="Top project leads by volume and top resources by reuse" />

      <div className={styles.body}>
        <SectionCard title="Project Leads" subtitle="Ranked by projects led" flush>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>#</th>
                <th className={styles.th}>Lead</th>
                <th className={`${styles.th} ${styles.num}`}>Projects</th>
                <th className={`${styles.th} ${styles.num}`}>Resourced</th>
                <th className={styles.th}>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((s, i) => (
                <tr key={s.leadId}>
                  <td className={`${styles.td} ${styles.rank}`}>{medal(i + 1)}</td>
                  <td className={styles.td}>
                    <span className={styles.who}>
                      <LeadAvatar leadId={s.leadId} size={28} />
                      {s.name}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.num}`}>{s.projects}</td>
                  <td className={`${styles.td} ${styles.num}`}>{s.covered}</td>
                  <td className={styles.td}>
                    <span className={styles.covCell}>
                      <CoverageBar value={s.coveragePct} />
                      <span className={styles.covPct}>{s.coveragePct}%</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Most reused resources" subtitle="Ranked by number of projects backed" flush>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>#</th>
                <th className={styles.th}>Resource</th>
                <th className={`${styles.th} ${styles.num}`}>Uses</th>
                <th className={styles.th}>Last used</th>
                <th className={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {topResources.map((r, i) => (
                <tr key={r.id}>
                  <td className={`${styles.td} ${styles.rank}`}>{medal(i + 1)}</td>
                  <td className={styles.td}>
                    <Link to={`/resources/${r.id}`} className={styles.link}>{r.name}</Link>
                  </td>
                  <td className={`${styles.td} ${styles.num}`}>
                    <Text weight="semibold">{r.reuse}</Text>
                  </td>
                  <td className={styles.td}>
                    <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                      {r.lastUsedOn ? formatDate(r.lastUsedOn) : 'Never'}
                    </Caption1>
                  </td>
                  <td className={styles.td}>
                    {r.isStale ? <Badge color="warning" appearance="tint">Stale</Badge> : <Badge color="success" appearance="tint">Active</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>
    </div>
  );
}
