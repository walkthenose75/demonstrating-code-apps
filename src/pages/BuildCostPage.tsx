import { makeStyles, tokens, Badge, Caption1, Body1, Text, Divider } from '@fluentui/react-components';
import {
  Money24Regular,
  Star24Regular,
  DataHistogram24Regular,
  Timer24Regular,
  BrainCircuit24Regular,
  Flash24Regular,
} from '@fluentui/react-icons';
import { aicUsage } from '@/data/aicUsage';
import { StatCard } from '@/components/ui/StatCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { DonutChart } from '@/components/charts/DonutChart';
import type { DonutSegment } from '@/components/charts/DonutChart';
import { compactNum, formatUsd, humanizeSeconds, formatDate } from '@/lib/format';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' },
  body: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 32px' },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  two: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', '@media (max-width: 960px)': { gridTemplateColumns: '1fr' } },
  donutRow: { display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' },
  legend: { display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px', flex: 1 },
  legendItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  swatch: { width: '12px', height: '12px', borderRadius: '3px', flexShrink: 0 },
  legendText: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  legendVal: { display: 'flex', gap: '8px', alignItems: 'baseline' },
  insight: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    padding: '18px 20px',
    borderRadius: tokens.borderRadiusLarge,
    background: 'linear-gradient(120deg, rgba(16,124,16,0.10), rgba(15,108,189,0.10))',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  insightBig: { fontSize: '30px', fontWeight: tokens.fontWeightBold, color: '#107c10', lineHeight: '32px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: tokens.fontSizeBase300 },
  th: {
    textAlign: 'left',
    padding: '8px 12px',
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: tokens.fontSizeBase200,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  td: { padding: '10px 12px', borderBottom: `1px solid ${tokens.colorNeutralStroke2}` },
  num: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  modelName: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: tokens.fontWeightSemibold },
  ckpt: { display: 'flex', flexDirection: 'column', gap: '2px' },
  basis: { color: tokens.colorNeutralForeground3, padding: '0 32px' },
});

const COST_COLORS = {
  fresh: '#0f6cbd',
  cacheRead: '#8764b8',
  cacheWrite: '#ca5010',
  output: '#107c10',
};

export function BuildCostPage() {
  const styles = useStyles();
  const u = aicUsage;

  const costSegments: (DonutSegment & { note: string })[] = [
    { label: 'Cache write', value: u.breakdown.cacheWriteUsd, color: COST_COLORS.cacheWrite, note: `${compactNum(u.totals.cacheWriteTokens)} tok` },
    { label: 'Cache read', value: u.breakdown.cacheReadUsd, color: COST_COLORS.cacheRead, note: `${compactNum(u.totals.cacheReadTokens)} tok` },
    { label: 'Output', value: u.breakdown.outputUsd, color: COST_COLORS.output, note: `${compactNum(u.totals.outputTokens)} tok` },
    { label: 'Fresh input', value: u.breakdown.freshInputUsd, color: COST_COLORS.fresh, note: `${compactNum(u.totals.freshInputTokens)} tok` },
  ];

  const tokenSegments: DonutSegment[] = [
    { label: 'Cache read', value: u.totals.cacheReadTokens, color: COST_COLORS.cacheRead },
    { label: 'Cache write', value: u.totals.cacheWriteTokens, color: COST_COLORS.cacheWrite },
    { label: 'Output', value: u.totals.outputTokens, color: COST_COLORS.output },
    { label: 'Fresh input', value: u.totals.freshInputTokens, color: COST_COLORS.fresh },
  ];

  // Naive (cache-blind) estimate: all input at full rate. Shows the caching win.
  const naive = u.models.reduce(
    (acc, m) => acc + (m.inputTokens * m.rates.input + m.outputTokens * m.rates.output) / 1_000_000,
    0,
  );
  const saved = naive - u.totals.costUsd;
  const savedPct = Math.round((saved / naive) * 100);

  return (
    <div className={styles.page}>
      <PageHeader
        hero
        title="AI Build Cost"
        subtitle={`What it cost to build Project Tracker with AI · captured ${formatDate(u.capturedAt)}`}
        actions={<Badge appearance="tint" color="success" size="large">{formatUsd(u.totals.costUsd)} total</Badge>}
      />

      <div className={styles.body}>
        <div className={styles.stats}>
          <StatCard label="Total Cost" value={formatUsd(u.totals.costUsd)} hint="cache-aware estimate" icon={<Money24Regular />} accentColor={COST_COLORS.output} />
          <StatCard label="Premium Credits" value={u.totals.credits.toLocaleString()} hint={`${u.totals.userTurns} turns · Opus ×10`} icon={<Star24Regular />} accentColor="#c19c00" />
          <StatCard label="Total Tokens" value={compactNum(u.totals.inputTokens + u.totals.outputTokens)} hint={`${compactNum(u.totals.inputTokens)} in · ${compactNum(u.totals.outputTokens)} out`} icon={<DataHistogram24Regular />} accentColor={COST_COLORS.cacheRead} />
          <StatCard label="Active Generation" value={humanizeSeconds(u.time.activeSeconds)} hint={`${humanizeSeconds(u.time.wallSeconds)} wall-clock`} icon={<Timer24Regular />} accentColor={COST_COLORS.fresh} />
          <StatCard label="Models Used" value={u.models.length} hint={u.models.map((m) => m.model).join(', ')} icon={<BrainCircuit24Regular />} accentColor="#5c2e91" />
          <StatCard label="Checkpoints" value={u.checkpoints.length} hint="running ledger" icon={<Flash24Regular />} accentColor={COST_COLORS.cacheWrite} />
        </div>

        <div className={styles.insight}>
          <Flash24Regular style={{ color: '#107c10', width: 32, height: 32 }} />
          <div>
            <div className={styles.insightBig}>{formatUsd(saved)} saved · {savedPct}%</div>
            <Body1>
              Prompt caching cut this build from a cache-blind {formatUsd(naive)} down to{' '}
              <strong>{formatUsd(u.totals.costUsd)}</strong>. {compactNum(u.totals.cacheReadTokens)} of{' '}
              {compactNum(u.totals.inputTokens)} input tokens were cache reads billed at ~10% of list price.
            </Body1>
          </div>
        </div>

        <div className={styles.two}>
          <SectionCard title="Cost breakdown" subtitle="Where the money went">
            <div className={styles.donutRow}>
              <DonutChart segments={costSegments} centerValue={formatUsd(u.totals.costUsd)} centerLabel="Total" />
              <div className={styles.legend}>
                {costSegments.map((s) => (
                  <div key={s.label} className={styles.legendItem}>
                    <span className={styles.swatch} style={{ backgroundColor: s.color }} />
                    <div className={styles.legendText}>
                      <div className={styles.legendVal}>
                        <Text weight="semibold">{formatUsd(s.value)}</Text>
                        <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>{s.label}</Caption1>
                      </div>
                      <Caption1 style={{ color: tokens.colorNeutralForeground4 }}>{s.note}</Caption1>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Token composition" subtitle={`${compactNum(u.totals.inputTokens + u.totals.outputTokens)} tokens total`}>
            <div className={styles.donutRow}>
              <DonutChart segments={tokenSegments} centerValue={compactNum(u.totals.inputTokens + u.totals.outputTokens)} centerLabel="Tokens" />
              <div className={styles.legend}>
                {tokenSegments.map((s) => (
                  <div key={s.label} className={styles.legendItem}>
                    <span className={styles.swatch} style={{ backgroundColor: s.color }} />
                    <div className={styles.legendText}>
                      <div className={styles.legendVal}>
                        <Text weight="semibold">{compactNum(s.value)}</Text>
                        <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>{s.label}</Caption1>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Models used" subtitle="Every model that contributed to this build" flush>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Model</th>
                <th className={styles.th}>Vendor</th>
                <th className={`${styles.th} ${styles.num}`}>Events</th>
                <th className={`${styles.th} ${styles.num}`}>Input</th>
                <th className={`${styles.th} ${styles.num}`}>Output</th>
                <th className={`${styles.th} ${styles.num}`}>Cost</th>
                <th className={`${styles.th} ${styles.num}`}>Credits</th>
                <th className={`${styles.th} ${styles.num}`}>Rate in/out</th>
              </tr>
            </thead>
            <tbody>
              {u.models.map((m) => (
                <tr key={m.model}>
                  <td className={styles.td}>
                    <span className={styles.modelName}>
                      <BrainCircuit24Regular style={{ width: 18, height: 18, color: '#5c2e91' }} />
                      {m.model}
                    </span>
                  </td>
                  <td className={styles.td}>{m.vendor}</td>
                  <td className={`${styles.td} ${styles.num}`}>{m.events}</td>
                  <td className={`${styles.td} ${styles.num}`}>{compactNum(m.inputTokens)}</td>
                  <td className={`${styles.td} ${styles.num}`}>{compactNum(m.outputTokens)}</td>
                  <td className={`${styles.td} ${styles.num}`}>{formatUsd(m.costUsd)}</td>
                  <td className={`${styles.td} ${styles.num}`}>{m.credits.toLocaleString()}</td>
                  <td className={`${styles.td} ${styles.num}`}>${m.rates.input}/${m.rates.output}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Running ledger" subtitle="Cumulative cost captured at each checkpoint">
          {u.checkpoints.map((c, i) => (
            <div key={c.label}>
              {i > 0 ? <Divider style={{ margin: '12px 0' }} /> : null}
              <div className={styles.ckpt}>
                <Text weight="semibold">{c.label}</Text>
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                  {formatDate(c.timestamp)} · cumulative {formatUsd(c.cumulativeCostUsd)} · {c.cumulativeCredits.toLocaleString()} credits · +{formatUsd(c.deltaCostUsd)} this checkpoint
                </Caption1>
              </div>
            </div>
          ))}
        </SectionCard>
      </div>

      <Caption1 className={styles.basis}>{u.basis}</Caption1>
    </div>
  );
}
