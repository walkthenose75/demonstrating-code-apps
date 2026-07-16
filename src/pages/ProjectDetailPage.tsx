import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  makeStyles, tokens, Spinner, MessageBar, MessageBarBody, Button, Text, Caption1, Avatar, Badge,
} from '@fluentui/react-components';
import { ArrowLeftRegular, DocumentRegular } from '@fluentui/react-icons';
import { useProjectExecution } from '@/hooks/useEnterprise';
import {
  healthColor, healthLabel, severityColor,
  type TaskStatus, type MilestoneStatus, type Task,
} from '@/lib/enterprise/model';
import { statusSet, outcomeSet } from '@/lib/optionSets';
import { OptionBadge } from '@/components/ui/OptionBadge';
import { PracticeAreaBadge } from '@/components/ui/PracticeAreaBadge';
import { LeadAvatar } from '@/components/ui/LeadAvatar';
import { CoverageBar } from '@/components/ui/CoverageBar';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import { clientName, leadName } from '@/mockData/reference';
import { formatDate, formatUsd, pct } from '@/lib/format';

const TASK_STATUS: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: 'To do', color: '#616161' },
  'in-progress': { label: 'In progress', color: '#0f6cbd' },
  blocked: { label: 'Blocked', color: '#c50f1f' },
  done: { label: 'Done', color: '#107c10' },
};

const MILESTONE_STATUS: Record<MilestoneStatus, { label: string; color: string }> = {
  upcoming: { label: 'Upcoming', color: '#616161' },
  'at-risk': { label: 'At risk', color: '#ca5010' },
  complete: { label: 'Complete', color: '#107c10' },
};

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' },
  body: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 32px' },
  meta: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' },
  two: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1fr)', gap: '20px', alignItems: 'start' },
  col: { display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: tokens.fontSizeBase300 },
  th: {
    textAlign: 'left', padding: '10px 14px', color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold, borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: tokens.fontSizeBase200, textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap',
  },
  td: { padding: '12px 14px', borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, verticalAlign: 'middle' },
  progressCell: { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' },
  who: { display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: tokens.borderRadiusCircular,
    padding: '3px 10px', fontSize: tokens.fontSizeBase200, fontWeight: tokens.fontWeightSemibold, whiteSpace: 'nowrap',
  },
  dep: { color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase200 },
  timeline: { display: 'flex', flexDirection: 'column', gap: '2px' },
  tlRow: { display: 'flex', gap: '14px', padding: '10px 4px' },
  tlRail: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  tlDot: { width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, marginTop: '3px' },
  tlLine: { flex: 1, width: '2px', backgroundColor: tokens.colorNeutralStroke2 },
  tlBody: { display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '10px' },
  finGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  finRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  raidItem: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 0', borderBottom: `1px solid ${tokens.colorNeutralStroke2}` },
  fileRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${tokens.colorNeutralStroke2}` },
  fileMeta: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  comment: { display: 'flex', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${tokens.colorNeutralStroke2}` },
  commentBody: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  center: { display: 'grid', placeItems: 'center', padding: '48px' },
  back: { textDecoration: 'none' },
});

function Chip({ label, color }: { label: string; color: string }) {
  const styles = useStyles();
  return (
    <span className={styles.chip} style={{ backgroundColor: `${color}14`, color }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
      {label}
    </span>
  );
}

export function ProjectDetailPage() {
  const styles = useStyles();
  const { id } = useParams<{ id: string }>();
  const { bundle, isLoading, isError } = useProjectExecution(id);

  const taskNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of bundle?.tasks ?? []) map.set(t.id, t.name);
    return map;
  }, [bundle]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <PageHeader hero title="Project" subtitle="Loading project detail…" />
        <div className={styles.center}><Spinner label="Loading project…" /></div>
      </div>
    );
  }

  if (isError || !bundle) {
    return (
      <div className={styles.page}>
        <PageHeader
          hero
          title="Project not found"
          subtitle="This project may have been removed."
          actions={<Button as="a" appearance="secondary" icon={<ArrowLeftRegular />} href="#/projects">Back to projects</Button>}
        />
        <div className={styles.body}>
          <MessageBar intent="error"><MessageBarBody>Unable to load this project.</MessageBarBody></MessageBar>
        </div>
      </div>
    );
  }

  const { project, tasks, milestones, health, financials, raid, comments, attachments } = bundle;
  const openRaid = raid.filter((r) => r.status !== 'closed');

  const varLabel = `${financials.variancePct > 0 ? '+' : ''}${financials.variancePct}%`;

  return (
    <div className={styles.page}>
      <PageHeader
        hero
        title={project.name}
        subtitle={
          <span className={styles.meta}>
            <span>{clientName(project.client)}</span>
            <span>·</span>
            <span>Lead: {leadName(project.projectLead)}</span>
            <span>·</span>
            <span>Started {formatDate(project.startDate)}</span>
          </span>
        }
        actions={
          <Button as="a" appearance="secondary" icon={<ArrowLeftRegular />} href="#/projects">
            Back to projects
          </Button>
        }
      />

      <div className={styles.body}>
        <div className={styles.meta}>
          <PracticeAreaBadge value={project.practiceArea} />
          <OptionBadge set={statusSet} value={project.status} />
          <OptionBadge set={outcomeSet} value={project.outcome} />
        </div>

        <div className={styles.stats}>
          <StatCard label="Overall health" value={health.label} accentColor={healthColor(health.status)} />
          <StatCard label="Complete" value={`${health.percentComplete}%`} hint={`${tasks.filter((t) => t.status === 'done').length}/${tasks.length} tasks done`} />
          <StatCard label="Schedule" value={healthLabel(health.schedule)} accentColor={healthColor(health.schedule)} />
          <StatCard label="Budget" value={formatUsd(financials.budgetUsd)} hint={`Forecast ${formatUsd(financials.forecastUsd)} · ${varLabel}`} accentColor={healthColor(financials.status)} />
          <StatCard label="Open risks" value={health.openRisks} accentColor={health.openRisks > 0 ? '#c50f1f' : '#107c10'} />
        </div>

        <div className={styles.two}>
          <div className={styles.col}>
            <SectionCard title="Tasks" subtitle={`${tasks.length} tasks · dependencies tracked`} flush>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Task</th>
                    <th className={styles.th}>Owner</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Progress</th>
                    <th className={styles.th}>Hours</th>
                    <th className={styles.th}>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t: Task) => {
                    const meta = TASK_STATUS[t.status];
                    return (
                      <tr key={t.id}>
                        <td className={styles.td}>
                          <Text weight="semibold">{t.name}</Text>
                          {t.dependsOn ? (
                            <div className={styles.dep}>↳ after {taskNameById.get(t.dependsOn) ?? 'predecessor'}</div>
                          ) : null}
                        </td>
                        <td className={styles.td}>
                          <span className={styles.who}>
                            <LeadAvatar leadId={t.assigneeId} size={24} />
                            <span>{leadName(t.assigneeId)}</span>
                          </span>
                        </td>
                        <td className={styles.td}><Chip label={meta.label} color={meta.color} /></td>
                        <td className={styles.td}>
                          <div className={styles.progressCell}>
                            <CoverageBar value={t.percentComplete} color={meta.color} />
                            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>{t.percentComplete}%</Caption1>
                          </div>
                        </td>
                        <td className={styles.td} style={{ whiteSpace: 'nowrap' }}>{t.loggedHours}/{t.estimateHours}h</td>
                        <td className={styles.td} style={{ whiteSpace: 'nowrap' }}>{formatDate(t.dueDate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </SectionCard>

            <SectionCard title="Milestones" subtitle="Stage gates flagged for approval">
              <div className={styles.timeline}>
                {milestones.map((m, i) => {
                  const meta = MILESTONE_STATUS[m.status];
                  return (
                    <div key={m.id} className={styles.tlRow}>
                      <div className={styles.tlRail}>
                        <span className={styles.tlDot} style={{ backgroundColor: meta.color }} />
                        {i < milestones.length - 1 ? <span className={styles.tlLine} /> : null}
                      </div>
                      <div className={styles.tlBody}>
                        <span className={styles.meta}>
                          <Text weight="semibold">{m.name}</Text>
                          {m.isGate ? <Badge appearance="tint" color="brand" size="small">Stage gate</Badge> : null}
                        </span>
                        <Caption1 style={{ color: meta.color, fontWeight: tokens.fontWeightSemibold }}>{meta.label}</Caption1>
                        <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Due {formatDate(m.dueDate)}</Caption1>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>

          <div className={styles.col}>
            <SectionCard title="Financials">
              <div className={styles.finGrid}>
                <div className={styles.finRow}><Caption1>Budget</Caption1><Text weight="semibold">{formatUsd(financials.budgetUsd)}</Text></div>
                <div className={styles.finRow}><Caption1>Actual to date</Caption1><Text weight="semibold">{formatUsd(financials.actualUsd)}</Text></div>
                <div className={styles.finRow}><Caption1>Forecast</Caption1><Text weight="semibold" style={{ color: healthColor(financials.status) }}>{formatUsd(financials.forecastUsd)}</Text></div>
                <div className={styles.finRow}><Caption1>Variance</Caption1><Chip label={varLabel} color={healthColor(financials.status)} /></div>
                <CoverageBar value={pct(financials.loggedHours, financials.estimateHours)} color={healthColor(financials.status)} />
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>{financials.loggedHours} of {financials.estimateHours} hrs logged</Caption1>
              </div>
            </SectionCard>

            <SectionCard title="Risks & issues" subtitle={`${openRaid.length} open`}>
              {openRaid.length === 0 ? (
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>No open risks or issues.</Caption1>
              ) : (
                openRaid.slice(0, 5).map((r) => (
                  <div key={r.id} className={styles.raidItem}>
                    <span className={styles.meta}>
                      <Chip label={r.severity} color={severityColor(r.severity)} />
                      <Caption1 style={{ textTransform: 'capitalize', color: tokens.colorNeutralForeground3 }}>{r.kind} · {r.status}</Caption1>
                    </span>
                    <Text>{r.title}</Text>
                    <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Owner {leadName(r.ownerId)} · due {formatDate(r.dueDate)}</Caption1>
                  </div>
                ))
              )}
            </SectionCard>

            <SectionCard title="Documents" subtitle={`${attachments.length} files`}>
              {attachments.map((a) => (
                <div key={a.id} className={styles.fileRow}>
                  <DocumentRegular />
                  <div className={styles.fileMeta}>
                    <Text weight="semibold">{a.name}</Text>
                    <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                      {(a.sizeKb / 1024).toFixed(1)} MB · {leadName(a.uploadedById)} · {formatDate(a.uploadedOn)}
                    </Caption1>
                  </div>
                </div>
              ))}
            </SectionCard>

            <SectionCard title="Comments" subtitle={`${comments.length}`}>
              {comments.map((c) => (
                <div key={c.id} className={styles.comment}>
                  <Avatar name={leadName(c.authorId)} size={28} color="colorful" />
                  <div className={styles.commentBody}>
                    <span className={styles.meta}>
                      <Text weight="semibold">{leadName(c.authorId)}</Text>
                      <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>{formatDate(c.timestamp)}</Caption1>
                    </span>
                    <Text>{c.body}</Text>
                  </div>
                </div>
              ))}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
