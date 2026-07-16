import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody, Text, Caption1 } from '@fluentui/react-components';
import { WarningRegular, TargetRegular } from '@fluentui/react-icons';
import { useCoverageAnalytics } from '@/hooks/useCoverageAnalytics';
import { customerName, sellerName } from '@/mockData/reference';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import { SolutionAreaBadge } from '@/components/ui/SolutionAreaBadge';
import { SellerAvatar } from '@/components/ui/SellerAvatar';

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
  presenter: { display: 'flex', alignItems: 'center', gap: '8px' },
  muted: { color: tokens.colorNeutralForeground3 },
  center: { display: 'grid', placeItems: 'center', padding: '48px' },
  empty: { padding: '48px 32px', textAlign: 'center', color: tokens.colorNeutralForeground3 },
});

export function GapsPage() {
  const styles = useStyles();
  const { isLoading, isError, gaps, summary } = useCoverageAnalytics();

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner label="Loading coverage gaps…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.body} style={{ paddingTop: 24 }}>
        <MessageBar intent="error">
          <MessageBarBody>Unable to load coverage gaps. Please try again.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const biggest = gaps[0];

  return (
    <div className={styles.page}>
      <PageHeader
        title="Coverage Gaps"
        subtitle="Story-only deliveries grouped by why no reusable asset backs them"
      />

      <div className={styles.body}>
        <div className={styles.stats}>
          <StatCard label="Story-only Deliveries" value={summary.storyOnly} hint="no linked asset" icon={<WarningRegular />} accentColor="#ca5010" />
          <StatCard
            label="Biggest Gap Reason"
            value={biggest ? biggest.label : '—'}
            hint={biggest ? `${biggest.deliveries.length} deliveries` : 'No gaps'}
            icon={<TargetRegular />}
            accentColor={biggest?.color ?? '#616161'}
          />
        </div>

        {gaps.length === 0 ? (
          <div className={styles.empty}>No coverage gaps — every delivery is asset-backed. 🎉</div>
        ) : (
          gaps.map((bucket) => (
            <SectionCard
              key={bucket.reason}
              title={
                <span className={styles.title}>
                  <span className={styles.dot} style={{ backgroundColor: bucket.color }} />
                  {bucket.label} ({bucket.deliveries.length})
                </span>
              }
            >
              {bucket.deliveries.map((d) => (
                <div key={d.id} className={styles.row}>
                  <Caption1 className={styles.muted}>{formatDate(d.deliveryDate)}</Caption1>
                  <Text weight="semibold">{d.name}</Text>
                  <SolutionAreaBadge value={d.solutionArea} />
                  <span className={styles.presenter}>
                    <SellerAvatar sellerId={d.presenter} size={24} />
                    {sellerName(d.presenter)}
                  </span>
                  <Caption1 className={styles.muted}>{customerName(d.customer)}</Caption1>
                </div>
              ))}
            </SectionCard>
          ))
        )}
      </div>
    </div>
  );
}
