import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody, Button, Text, Caption1 } from '@fluentui/react-components';
import {
  Board24Regular,
  CheckmarkCircle24Regular,
  DocumentText24Regular,
  Box24Regular,
  ArrowRepeatAll24Regular,
  DataPie24Regular,
  ArrowRight16Regular,
} from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { useCoverageAnalytics } from '@/hooks/useCoverageAnalytics';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import { CoverageBar } from '@/components/ui/CoverageBar';
import { CoverageDial } from '@/components/charts/CoverageDial';
import { TrendChart } from '@/components/charts/TrendChart';
import { ActivityHeatmap } from '@/components/charts/ActivityHeatmap';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' },
  body: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 32px' },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  two: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 340px) minmax(0, 1fr)',
    gap: '20px',
    '@media (max-width: 960px)': { gridTemplateColumns: '1fr' },
  },
  dialRow: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  dialCounts: { display: 'flex', gap: '24px' },
  count: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  countBig: { fontSize: '24px', fontWeight: tokens.fontWeightBold, lineHeight: '26px' },
  areaRow: {
    display: 'grid',
    gridTemplateColumns: '180px 64px 1fr 48px',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
  },
  areaLabel: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 },
  dot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  areaName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  muted: { color: tokens.colorNeutralForeground3, fontVariantNumeric: 'tabular-nums' },
  pctCell: { textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: tokens.fontWeightSemibold },
  assetRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '10px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  assetName: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  reuse: { display: 'flex', alignItems: 'center', gap: '6px', color: tokens.colorNeutralForeground2, fontWeight: tokens.fontWeightSemibold, flexShrink: 0 },
  center: { display: 'grid', placeItems: 'center', padding: '48px' },
});

export function DashboardPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { isLoading, isError, summary, byArea, trend, topAssets, assets, heatmap, heatMax } = useCoverageAnalytics();

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner label="Loading coverage analytics…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.body} style={{ paddingTop: 24 }}>
        <MessageBar intent="error">
          <MessageBarBody>Unable to load coverage analytics. Please try again.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const totalReuse = assets.reduce((sum, a) => sum + (a.reuseCount ?? 0), 0);
  const avgReuse = assets.length > 0 ? (totalReuse / assets.length).toFixed(1) : '0';

  return (
    <div className={styles.page}>
      <PageHeader
        hero
        title="Coverage Command Center"
        subtitle="How much of our field demo motion is backed by reusable assets"
        actions={
          <Button appearance="primary" icon={<ArrowRight16Regular />} iconPosition="after" onClick={() => navigate('/deliveries')}>
            Browse deliveries
          </Button>
        }
      />

      <div className={styles.body}>
        <div className={styles.stats}>
          <StatCard label="Total Deliveries" value={summary.total} icon={<Board24Regular />} accentColor="#0f6cbd" />
          <StatCard label="Asset-Backed" value={summary.covered} hint="≥1 linked asset" icon={<CheckmarkCircle24Regular />} accentColor="#107c10" />
          <StatCard label="Story Only" value={summary.storyOnly} hint="no linked asset" icon={<DocumentText24Regular />} accentColor="#ca5010" />
          <StatCard label="Assets in Catalog" value={assets.length} icon={<Box24Regular />} accentColor="#5c2e91" />
          <StatCard label="Avg Reuse / Asset" value={avgReuse} hint="deliveries per asset" icon={<ArrowRepeatAll24Regular />} accentColor="#8764b8" />
          <StatCard label="Coverage %" value={`${summary.coveragePct}%`} icon={<DataPie24Regular />} accentColor="#c19c00" />
        </div>

        <div className={styles.two}>
          <SectionCard title="Coverage" subtitle="Asset-backed vs. story-only">
            <div className={styles.dialRow}>
              <CoverageDial value={summary.coveragePct} />
              <div className={styles.dialCounts}>
                <div className={styles.count}>
                  <span className={styles.countBig} style={{ color: '#107c10' }}>{summary.covered}</span>
                  <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Covered</Caption1>
                </div>
                <div className={styles.count}>
                  <span className={styles.countBig} style={{ color: '#ca5010' }}>{summary.storyOnly}</span>
                  <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Story only</Caption1>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Trend" subtitle="Monthly delivery volume and coverage">
            <TrendChart data={trend} />
          </SectionCard>
        </div>

        <SectionCard title="Activity" subtitle="Delivery cadence over the last 26 weeks">
          <ActivityHeatmap grid={heatmap} max={heatMax} />
        </SectionCard>

        <SectionCard title="Coverage by solution area" subtitle="Where our asset backing is strong or thin">
          {byArea.map((row) => (
            <div key={row.area} className={styles.areaRow}>
              <div className={styles.areaLabel}>
                <span className={styles.dot} style={{ backgroundColor: row.color }} />
                <Text className={styles.areaName}>{row.label}</Text>
              </div>
              <Caption1 className={styles.muted}>{row.covered}/{row.total}</Caption1>
              <CoverageBar value={row.coveragePct} color={row.color} />
              <span className={styles.pctCell}>{row.coveragePct}%</span>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Top reused assets" subtitle="Assets backing the most deliveries" flush>
          <div style={{ padding: '0 20px' }}>
            {topAssets.slice(0, 6).map((asset) => (
              <div key={asset.id} className={styles.assetRow}>
                <div className={styles.assetName}>
                  <Text weight="semibold">{asset.name}</Text>
                  {asset.maintainer ? (
                    <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Maintained by {asset.maintainer}</Caption1>
                  ) : null}
                </div>
                <span className={styles.reuse}>
                  <ArrowRepeatAll24Regular style={{ width: 18, height: 18 }} />
                  {asset.reuse}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
