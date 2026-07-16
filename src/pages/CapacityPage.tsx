import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import { CoverageBar } from '@/components/ui/CoverageBar';
import { useCapacity } from '@/hooks/useEnterprise';
import { capacityColor, type PersonCapacity } from '@/lib/enterprise/model';
import { Avatar, Spinner, MessageBar, MessageBarBody, Text, Caption1, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' },
  body: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 32px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: tokens.fontSizeBase300 },
  th: { textAlign: 'left', padding: '10px 14px', color: tokens.colorNeutralForeground3, fontWeight: tokens.fontWeightSemibold, borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, fontSize: tokens.fontSizeBase200, textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, verticalAlign: 'middle' },
  person: { display: 'flex', alignItems: 'center', gap: '10px' },
  util: { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px' },
  center: { display: 'grid', placeItems: 'center', padding: '48px' },
  chip: { display: 'inline-flex', alignItems: 'center', borderRadius: tokens.borderRadiusCircular, padding: '3px 10px', fontSize: tokens.fontSizeBase200, fontWeight: tokens.fontWeightSemibold },
  alerts: { display: 'flex', flexDirection: 'column', gap: '8px' },
});

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function statusLabel(status: PersonCapacity['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function CapacityPage() {
  const styles = useStyles();
  const { rows, isLoading, isError } = useCapacity();

  const overAllocated = rows.filter((row) => row.status === 'over');
  const available = rows.filter((row) => row.status === 'available');
  const avgUtilization = rows.length > 0
    ? Math.round(rows.reduce((sum, row) => sum + row.allocationPct, 0) / rows.length)
    : 0;

  return (
    <div className={styles.page}>
      <PageHeader
        hero
        title="Capacity"
        subtitle="Team utilization and load balancing across the project portfolio"
      />

      {isLoading ? (
        <div className={styles.center}>
          <Spinner label="Loading capacity…" />
        </div>
      ) : isError ? (
        <div className={styles.body}>
          <MessageBar intent="error">
            <MessageBarBody>Unable to load capacity data. Please try again.</MessageBarBody>
          </MessageBar>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.stats}>
            <StatCard label="People allocated" value={rows.length} accentColor="#0f6cbd" />
            <StatCard label="Over-allocated" value={overAllocated.length} accentColor="#c50f1f" />
            <StatCard label="Available" value={available.length} accentColor="#107c10" />
            <StatCard label="Avg utilization %" value={`${avgUtilization}%`} accentColor="#0f6cbd" />
          </div>

          <SectionCard title="Utilization" subtitle="Allocation versus weekly capacity by project lead" flush>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th} scope="col">Person</th>
                  <th className={styles.th} scope="col">Active projects</th>
                  <th className={styles.th} scope="col">Allocated hrs</th>
                  <th className={styles.th} scope="col">Capacity</th>
                  <th className={styles.th} scope="col">Utilization</th>
                  <th className={styles.th} scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.personId}>
                    <td className={styles.td}>
                      <div className={styles.person}>
                        <Avatar name={row.name} initials={row.initials} size={32} color="colorful" />
                        <div>
                          <Text weight="semibold">{row.name}</Text>
                          <br />
                          <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>{row.title}</Caption1>
                        </div>
                      </div>
                    </td>
                    <td className={styles.td}>{row.activeProjects}</td>
                    <td className={styles.td}>{row.allocatedHours}</td>
                    <td className={styles.td}>{row.capacityHours}</td>
                    <td className={styles.td}>
                      <div className={styles.util}>
                        <CoverageBar value={Math.min(100, row.allocationPct)} color={capacityColor(row.status)} />
                        <Caption1>{formatPercent(row.allocationPct)}</Caption1>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span
                        className={styles.chip}
                        style={{
                          backgroundColor: `${capacityColor(row.status)}14`,
                          color: capacityColor(row.status),
                        }}
                      >
                        {statusLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          <SectionCard title="Over-allocation alerts" subtitle="Leads who need portfolio rebalancing">
            <div className={styles.alerts}>
              {overAllocated.length > 0 ? (
                overAllocated.map((row) => (
                  <MessageBar key={row.personId} intent="warning">
                    <MessageBarBody>
                      {row.name} is at {formatPercent(row.allocationPct)} across {row.activeProjects} projects — rebalance recommended
                    </MessageBarBody>
                  </MessageBar>
                ))
              ) : (
                <MessageBar intent="success">
                  <MessageBarBody>All leads are within capacity.</MessageBarBody>
                </MessageBar>
              )}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
