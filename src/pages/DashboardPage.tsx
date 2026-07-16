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
import { leadName } from '@/mockData/reference';
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
  const { isLoading, isError, summary, byArea, trend, topResources, resources, heatmap, heatMax } = useCoverageAnalytics();

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner label="Loading portfolio analytics…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.body} style={{ paddingTop: 24 }}>
        <MessageBar intent="error">
          <MessageBarBody>Unable to load portfolio analytics. Please try again.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const totalReuse = resources.reduce((sum, r) => sum + (r.usageCount ?? 0), 0);
  const avgReuse = resources.length > 0 ? (totalReuse / resources.length).toFixed(1) : '0';

  return (
    <div className={styles.page}>
      <PageHeader
        hero
        title="Portfolio Command Center"
        subtitle="How much of our project portfolio is backed by reusable resources"
        actions={
          <Button appearance="primary" icon={<ArrowRight16Regular />} iconPosition="after" onClick={() => navigate('/projects')}>
            Browse projects
          </Button>
        }
      />

      <div className={styles.body}>
        <div className={styles.stats}>
          <StatCard label="Total Projects" value={summary.total} icon={<Board24Regular />} accentColor="#0f6cbd" />
          <StatCard label="Resourced" value={summary.covered} hint="≥1 linked resource" icon={<CheckmarkCircle24Regular />} accentColor="#107c10" />
          <StatCard label="At Risk" value={summary.storyOnly} hint="no linked resource" icon={<DocumentText24Regular />} accentColor="#ca5010" />
          <StatCard label="Resources in Library" value={resources.length} icon={<Box24Regular />} accentColor="#5c2e91" />
          <StatCard label="Avg Uses / Resource" value={avgReuse} hint="projects per resource" icon={<ArrowRepeatAll24Regular />} accentColor="#8764b8" />
          <StatCard label="Resourced %" value={`${summary.coveragePct}%`} icon={<DataPie24Regular />} accentColor="#c19c00" />
        </div>

        <div className={styles.two}>
          <SectionCard title="Coverage" subtitle="Resourced vs. at-risk">
            <div className={styles.dialRow}>
              <CoverageDial value={summary.coveragePct} />
              <div className={styles.dialCounts}>
                <div className={styles.count}>
                  <span className={styles.countBig} style={{ color: '#107c10' }}>{summary.covered}</span>
                  <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Resourced</Caption1>
                </div>
                <div className={styles.count}>
                  <span className={styles.countBig} style={{ color: '#ca5010' }}>{summary.storyOnly}</span>
                  <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>At risk</Caption1>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Trend" subtitle="Monthly project volume and coverage">
            <TrendChart data={trend} />
          </SectionCard>
        </div>

        <SectionCard title="Activity" subtitle="Project cadence over the last 26 weeks">
          <ActivityHeatmap grid={heatmap} max={heatMax} />
        </SectionCard>

        <SectionCard title="Coverage by practice area" subtitle="Where our resource backing is strong or thin">
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

        <SectionCard title="Top reused resources" subtitle="Resources backing the most projects" flush>
          <div style={{ padding: '0 20px' }}>
            {topResources.slice(0, 6).map((resource) => (
              <div key={resource.id} className={styles.assetRow}>
                <div className={styles.assetName}>
                  <Text weight="semibold">{resource.name}</Text>
                  {resource.owner ? (
                    <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Owned by {leadName(resource.owner)}</Caption1>
                  ) : null}
                </div>
                <span className={styles.reuse}>
                  <ArrowRepeatAll24Regular style={{ width: 18, height: 18 }} />
                  {resource.reuse}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
