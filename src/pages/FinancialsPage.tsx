import { useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import { DonutChart } from '@/components/charts/DonutChart';
import { CoverageBar } from '@/components/ui/CoverageBar';
import { usePortfolioFinancials } from '@/hooks/useEnterprise';
import type { ProjectFinancials } from '@/lib/enterprise/model';
import { healthColor, healthLabel } from '@/lib/enterprise/model';
import { RATES } from '@/lib/enterprise/generate';
import { formatUsd, compactNum, pct, formatDate } from '@/lib/format';
import { Spinner, MessageBar, MessageBarBody, Text, Caption1, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' },
  body: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 32px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: tokens.fontSizeBase300 },
  th: { textAlign: 'left', padding: '10px 14px', color: tokens.colorNeutralForeground3, fontWeight: tokens.fontWeightSemibold, borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, fontSize: tokens.fontSizeBase200, textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, verticalAlign: 'middle' },
  center: { display: 'grid', placeItems: 'center', padding: '48px' },
  chip: { display: 'inline-flex', alignItems: 'center', borderRadius: tokens.borderRadiusCircular, padding: '3px 10px', fontSize: tokens.fontSizeBase200, fontWeight: tokens.fontWeightSemibold, fontVariantNumeric: 'tabular-nums' },
});

const GREEN = '#107c10';
const AMBER = '#ca5010';
const RED = '#c50f1f';

function varianceColor(variancePct: number): string {
  if (variancePct <= 3) return GREEN;
  if (variancePct <= 10) return AMBER;
  return RED;
}

function formatVariance(variancePct: number): string {
  return `${variancePct > 0 ? '+' : ''}${variancePct}%`;
}

export function FinancialsPage() {
  const styles = useStyles();
  const { rows, isLoading, isError } = usePortfolioFinancials();

  const totals = useMemo(() => {
    const totalBudget = rows.reduce((sum, row) => sum + row.budgetUsd, 0);
    const totalForecast = rows.reduce((sum, row) => sum + row.forecastUsd, 0);
    const totalActual = rows.reduce((sum, row) => sum + row.actualUsd, 0);
    const portfolioVariancePct = pct(totalForecast - totalBudget, totalBudget);
    return { totalBudget, totalForecast, totalActual, portfolioVariancePct };
  }, [rows]);

  const sortedRows = useMemo(
    () => rows.slice().sort((a, b) => b.variancePct - a.variancePct),
    [rows],
  );

  const statusSegments = useMemo(
    () => [
      { label: 'On Track', value: rows.filter((row) => row.status === 'green').length, color: GREEN },
      { label: 'At Risk', value: rows.filter((row) => row.status === 'amber').length, color: AMBER },
      { label: 'Over Budget', value: rows.filter((row) => row.status === 'red').length, color: RED },
    ],
    [rows],
  );

  return (
    <div className={styles.page}>
      <PageHeader
        hero
        title="Financials"
        subtitle="Portfolio budget health across forecast, actual spend, variance, and delivery hours."
      />

      {isLoading ? (
        <div className={styles.center}>
          <Spinner label="Loading portfolio financials…" />
        </div>
      ) : isError ? (
        <div style={{ padding: '0 32px' }}>
          <MessageBar intent="error">
            <MessageBarBody>Unable to load portfolio financials. Please try again.</MessageBarBody>
          </MessageBar>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.stats}>
            <StatCard label="Total Budget" value={formatUsd(totals.totalBudget)} hint={`${rows.length} projects`} accentColor={GREEN} />
            <StatCard label="Total Forecast" value={formatUsd(totals.totalForecast)} hint="expected at completion" accentColor={varianceColor(totals.portfolioVariancePct)} />
            <StatCard label="Total Actual" value={formatUsd(totals.totalActual)} hint="to date" accentColor="#0f6cbd" />
            <StatCard
              label="Portfolio Variance %"
              value={formatVariance(totals.portfolioVariancePct)}
              hint={totals.portfolioVariancePct <= 0 ? 'under budget' : 'over budget'}
              accentColor={varianceColor(totals.portfolioVariancePct)}
            />
          </div>

          <SectionCard title="Budget vs forecast" subtitle="Projects by budget health status">
            <div className={styles.center}>
              <DonutChart
                segments={statusSegments}
                size={220}
                thickness={30}
                centerValue={String(rows.length)}
                centerLabel="Projects"
              />
            </div>
          </SectionCard>

          <SectionCard title="Project economics" subtitle="Worst forecast variance first" flush>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Project</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Budget</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Actual</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Forecast</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Variance</th>
                  <th className={styles.th}>Hours (logged/estimate)</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row: ProjectFinancials) => {
                  const hoursPct = pct(row.loggedHours, row.estimateHours);
                  return (
                    <tr key={row.projectId}>
                      <td className={styles.td}>
                        <Text weight="semibold">{row.projectName}</Text>
                        <Caption1 style={{ display: 'block', color: tokens.colorNeutralForeground3 }}>
                          {healthLabel(row.status)}
                        </Caption1>
                      </td>
                      <td className={styles.td} style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatUsd(row.budgetUsd)}</td>
                      <td className={styles.td} style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatUsd(row.actualUsd)}</td>
                      <td className={styles.td} style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatUsd(row.forecastUsd)}</td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <span className={styles.chip} style={{ backgroundColor: varianceColor(row.variancePct), color: '#fff' }}>
                          {formatVariance(row.variancePct)}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <Text>{compactNum(row.loggedHours)} / {compactNum(row.estimateHours)} hrs</Text>
                        <div style={{ marginTop: '6px' }}>
                          <CoverageBar value={hoursPct} color={healthColor(row.status)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </SectionCard>

          <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
            Insight: portfolio economics use a blended rate of {formatUsd(RATES.blendedUsdPerHour)}/hr, refreshed {formatDate(new Date().toISOString())}.
          </Caption1>
        </div>
      )}
    </div>
  );
}
