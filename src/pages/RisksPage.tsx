import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody, Text, Caption1 } from '@fluentui/react-components';
import { WarningRegular, TargetRegular } from '@fluentui/react-icons';
import { useCoverageAnalytics } from '@/hooks/useCoverageAnalytics';
import { clientName, leadName } from '@/mockData/reference';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import { PracticeAreaBadge } from '@/components/ui/PracticeAreaBadge';
import { LeadAvatar } from '@/components/ui/LeadAvatar';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' },
  body: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 32px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  title: { display: 'inline-flex', alignItems: 'center', gap: '8px' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  row: {
    display: 'grid',
    gridTemplateColumns: '110px 1fr 140px 180px 160px',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  lead: { display: 'flex', alignItems: 'center', gap: '8px' },
  muted: { color: tokens.colorNeutralForeground3 },
  center: { display: 'grid', placeItems: 'center', padding: '48px' },
  empty: { padding: '48px 32px', textAlign: 'center', color: tokens.colorNeutralForeground3 },
});

export function RisksPage() {
  const styles = useStyles();
  const { isLoading, isError, gaps, summary } = useCoverageAnalytics();

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner label="Loading at-risk projects…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.body} style={{ paddingTop: 24 }}>
        <MessageBar intent="error">
          <MessageBarBody>Unable to load at-risk projects. Please try again.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const biggest = gaps[0];

  return (
    <div className={styles.page}>
      <PageHeader
        title="At-Risk Projects"
        subtitle="Projects with no reusable resource, grouped by why they are at risk"
      />

      <div className={styles.body}>
        <div className={styles.stats}>
          <StatCard label="At-Risk Projects" value={summary.storyOnly} hint="no linked resource" icon={<WarningRegular />} accentColor="#ca5010" />
          <StatCard
            label="Biggest Risk Reason"
            value={biggest ? biggest.label : '—'}
            hint={biggest ? `${biggest.projects.length} projects` : 'No risks'}
            icon={<TargetRegular />}
            accentColor={biggest?.color ?? '#616161'}
          />
        </div>

        {gaps.length === 0 ? (
          <div className={styles.empty}>No at-risk projects — every project is resourced. 🎉</div>
        ) : (
          gaps.map((bucket) => (
            <SectionCard
              key={bucket.reason}
              title={
                <span className={styles.title}>
                  <span className={styles.dot} style={{ backgroundColor: bucket.color }} />
                  {bucket.label} ({bucket.projects.length})
                </span>
              }
            >
              {bucket.projects.map((p) => (
                <div key={p.id} className={styles.row}>
                  <Caption1 className={styles.muted}>{formatDate(p.startDate)}</Caption1>
                  <Text weight="semibold">{p.name}</Text>
                  <PracticeAreaBadge value={p.practiceArea} />
                  <span className={styles.lead}>
                    <LeadAvatar leadId={p.projectLead} size={24} />
                    {leadName(p.projectLead)}
                  </span>
                  <Caption1 className={styles.muted}>{clientName(p.client)}</Caption1>
                </div>
              ))}
            </SectionCard>
          ))
        )}
      </div>
    </div>
  );
}
