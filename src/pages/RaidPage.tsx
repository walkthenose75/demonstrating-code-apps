import { useState } from 'react';
import { TabList, Tab, Spinner, MessageBar, MessageBarBody, Text, Caption1, makeStyles, tokens } from '@fluentui/react-components';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import { useRaid } from '@/hooks/useEnterprise';
import type { ApprovalGate, ApprovalStatus, RaidItem, RaidKind, RaidSeverity, RaidStatus } from '@/lib/enterprise/model';
import { severityColor } from '@/lib/enterprise/model';
import { formatDate } from '@/lib/format';
import { leadName } from '@/mockData/reference';

type RaidFilter = 'all' | RaidKind;

const KIND_COLORS: Record<RaidKind, string> = {
  risk: '#c50f1f',
  issue: '#ca5010',
  decision: '#0f6cbd',
  dependency: '#8764b8',
};

const RAID_STATUS_COLORS: Record<RaidStatus, string> = {
  open: '#c50f1f',
  mitigating: '#ca5010',
  closed: '#616161',
};

const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: '#ca5010',
  approved: '#107c10',
  rejected: '#c50f1f',
};

const SEVERITY_RANK: Record<RaidSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' },
  body: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 32px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: tokens.fontSizeBase300 },
  th: { textAlign: 'left', padding: '10px 14px', color: tokens.colorNeutralForeground3, fontWeight: tokens.fontWeightSemibold, borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, fontSize: tokens.fontSizeBase200, textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, verticalAlign: 'middle' },
  center: { display: 'grid', placeItems: 'center', padding: '48px' },
  chip: { display: 'inline-flex', alignItems: 'center', borderRadius: tokens.borderRadiusCircular, padding: '3px 10px', fontSize: tokens.fontSizeBase200, fontWeight: tokens.fontWeightSemibold, whiteSpace: 'nowrap' },
  empty: { padding: '32px', textAlign: 'center', color: tokens.colorNeutralForeground3 },
});

function capitalize(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function chip(styles: ReturnType<typeof useStyles>, label: string, color: string) {
  return <span className={styles.chip} style={{ backgroundColor: `${color}14`, color }}>{capitalize(label)}</span>;
}

function sortRaidItems(a: RaidItem, b: RaidItem): number {
  const aStatusRank = a.status === 'closed' ? 1 : 0;
  const bStatusRank = b.status === 'closed' ? 1 : 0;
  if (aStatusRank !== bStatusRank) return aStatusRank - bStatusRank;
  return SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
}

export function RaidPage() {
  const styles = useStyles();
  const { raid, approvals, isLoading, isError } = useRaid();
  const [filter, setFilter] = useState<RaidFilter>('all');

  const openRisks = raid.filter((item) => item.kind === 'risk' && item.status !== 'closed').length;
  const openIssues = raid.filter((item) => item.kind === 'issue' && item.status !== 'closed').length;
  const decisionsLogged = raid.filter((item) => item.kind === 'decision').length;
  const pendingApprovals = approvals.filter((approval) => approval.status === 'pending').length;
  const filteredRaid = raid
    .filter((item) => filter === 'all' || item.kind === filter)
    .slice()
    .sort(sortRaidItems);

  return (
    <div className={styles.page}>
      <PageHeader
        hero
        title="RAID & Governance"
        subtitle="Track portfolio risks, issues, decisions, dependencies, and stage-gate approvals in one governance view."
      />

      {isLoading ? (
        <div className={styles.center}>
          <Spinner label="Loading RAID and governance data…" />
        </div>
      ) : isError ? (
        <div className={styles.center}>
          <MessageBar intent="error">
            <MessageBarBody>Unable to load RAID and governance data. Please try again.</MessageBarBody>
          </MessageBar>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.stats}>
            <StatCard label="Open risks" value={openRisks} accentColor="#c50f1f" />
            <StatCard label="Open issues" value={openIssues} accentColor="#ca5010" />
            <StatCard label="Decisions logged" value={decisionsLogged} accentColor="#0f6cbd" />
            <StatCard label="Pending approvals" value={pendingApprovals} accentColor="#0f6cbd" />
          </div>

          <TabList selectedValue={filter} onTabSelect={(_event, data) => setFilter(data.value as RaidFilter)}>
            <Tab value="all">All</Tab>
            <Tab value="risk">Risks</Tab>
            <Tab value="issue">Issues</Tab>
            <Tab value="decision">Decisions</Tab>
            <Tab value="dependency">Dependencies</Tab>
          </TabList>

          <SectionCard title="RAID log" subtitle={`${filteredRaid.length} ${filteredRaid.length === 1 ? 'item' : 'items'} shown`} flush>
            {filteredRaid.length === 0 ? (
              <div className={styles.empty}>No RAID items match the selected filter.</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Type</th>
                    <th className={styles.th}>Title</th>
                    <th className={styles.th}>Project</th>
                    <th className={styles.th}>Severity</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Owner</th>
                    <th className={styles.th}>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRaid.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.td}>{chip(styles, item.kind, KIND_COLORS[item.kind])}</td>
                      <td className={styles.td}><Text weight="semibold">{item.title}</Text></td>
                      <td className={styles.td}>{item.projectName}</td>
                      <td className={styles.td}>{chip(styles, item.severity, severityColor(item.severity))}</td>
                      <td className={styles.td}>{chip(styles, item.status, RAID_STATUS_COLORS[item.status])}</td>
                      <td className={styles.td}>{leadName(item.ownerId)}</td>
                      <td className={styles.td}>{formatDate(item.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>

          <SectionCard title="Approval queue" subtitle="Stage-gate decisions waiting on governance action" flush>
            {approvals.length === 0 ? (
              <div className={styles.empty}>No approval gates are queued.</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Gate</th>
                    <th className={styles.th}>Project</th>
                    <th className={styles.th}>Approver</th>
                    <th className={styles.th}>Requested</th>
                    <th className={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map((approval: ApprovalGate) => (
                    <tr key={approval.id}>
                      <td className={styles.td}><Text weight="semibold">{approval.name}</Text></td>
                      <td className={styles.td}>{approval.projectName}</td>
                      <td className={styles.td}>{leadName(approval.approverId)}</td>
                      <td className={styles.td}>{formatDate(approval.requestedOn)}</td>
                      <td className={styles.td}>{chip(styles, approval.status, APPROVAL_STATUS_COLORS[approval.status])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>

          <Caption1>Open and critical items are sorted to the top of the RAID log.</Caption1>
        </div>
      )}
    </div>
  );
}
