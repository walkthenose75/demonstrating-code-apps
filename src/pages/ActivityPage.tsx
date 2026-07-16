import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  makeStyles, tokens, Spinner, MessageBar, MessageBarBody, Avatar, Text, Caption1, TabList, Tab,
} from '@fluentui/react-components';
import {
  CommentRegular, CheckmarkCircleRegular, DocumentRegular, FlagRegular, TaskListSquareLtrRegular, InfoRegular,
} from '@fluentui/react-icons';
import type { ReactNode } from 'react';
import { useActivityFeed } from '@/hooks/useEnterprise';
import type { ActivityKind } from '@/lib/enterprise/model';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import { leadName } from '@/mockData/reference';
import { formatDate, daysSince } from '@/lib/format';

const KIND: Record<ActivityKind, { label: string; color: string; icon: ReactNode }> = {
  comment: { label: 'Comment', color: '#8764b8', icon: <CommentRegular /> },
  status: { label: 'Status', color: '#0f6cbd', icon: <InfoRegular /> },
  task: { label: 'Task', color: '#107c10', icon: <TaskListSquareLtrRegular /> },
  file: { label: 'File', color: '#ca5010', icon: <DocumentRegular /> },
  milestone: { label: 'Milestone', color: '#c19c00', icon: <FlagRegular /> },
  approval: { label: 'Approval', color: '#c50f1f', icon: <CheckmarkCircleRegular /> },
};

type FilterKey = 'all' | ActivityKind;

function relative(iso: string): string {
  const d = daysSince(iso);
  if (d === undefined) return formatDate(iso);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return formatDate(iso);
}

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' },
  body: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 32px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' },
  feed: { display: 'flex', flexDirection: 'column' },
  row: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 4px', borderBottom: `1px solid ${tokens.colorNeutralStroke2}` },
  iconWrap: { display: 'grid', placeItems: 'center', width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0 },
  main: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 },
  line: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'baseline' },
  link: { color: tokens.colorBrandForeground1, textDecoration: 'none', fontWeight: tokens.fontWeightSemibold },
  when: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  center: { display: 'grid', placeItems: 'center', padding: '48px' },
  empty: { padding: '32px', textAlign: 'center', color: tokens.colorNeutralForeground3 },
});

export function ActivityPage() {
  const styles = useStyles();
  const { events, isLoading, isError } = useActivityFeed();
  const [filter, setFilter] = useState<FilterKey>('all');

  const counts = useMemo(() => {
    const c = { comment: 0, status: 0, task: 0, file: 0, milestone: 0, approval: 0 } as Record<ActivityKind, number>;
    for (const e of events) c[e.kind] += 1;
    return c;
  }, [events]);

  const shown = useMemo(
    () => (filter === 'all' ? events : events.filter((e) => e.kind === filter)).slice(0, 60),
    [events, filter],
  );

  return (
    <div className={styles.page}>
      <PageHeader hero title="Activity" subtitle="A live portfolio feed of updates, decisions, and approvals across every project" />

      {isLoading ? (
        <div className={styles.center}><Spinner label="Loading activity…" /></div>
      ) : isError ? (
        <div className={styles.body}>
          <MessageBar intent="error"><MessageBarBody>Unable to load activity.</MessageBarBody></MessageBar>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.stats}>
            <StatCard label="Total events" value={events.length} />
            <StatCard label="Approvals" value={counts.approval} accentColor={KIND.approval.color} />
            <StatCard label="Milestones" value={counts.milestone} accentColor={KIND.milestone.color} />
            <StatCard label="Comments" value={counts.comment} accentColor={KIND.comment.color} />
          </div>

          <TabList selectedValue={filter} onTabSelect={(_e, d) => setFilter(d.value as FilterKey)}>
            <Tab value="all">All</Tab>
            <Tab value="status">Status</Tab>
            <Tab value="task">Tasks</Tab>
            <Tab value="milestone">Milestones</Tab>
            <Tab value="approval">Approvals</Tab>
            <Tab value="comment">Comments</Tab>
            <Tab value="file">Files</Tab>
          </TabList>

          <SectionCard title="Recent activity" subtitle={`${shown.length} shown`}>
            {shown.length === 0 ? (
              <div className={styles.empty}>No activity of this type.</div>
            ) : (
              <div className={styles.feed}>
                {shown.map((e) => {
                  const meta = KIND[e.kind];
                  return (
                    <div key={e.id} className={styles.row}>
                      <Avatar name={leadName(e.actorId)} size={32} color="colorful" />
                      <div className={styles.iconWrap} style={{ backgroundColor: `${meta.color}14`, color: meta.color }}>
                        {meta.icon}
                      </div>
                      <div className={styles.main}>
                        <div className={styles.line}>
                          <Text weight="semibold">{leadName(e.actorId)}</Text>
                          <Text>{e.message}</Text>
                          <Text style={{ color: tokens.colorNeutralForeground3 }}>on</Text>
                          <Link className={styles.link} to={`/projects/${e.projectId}`}>{e.projectName}</Link>
                        </div>
                        <Caption1 className={styles.when}>{meta.label} · {relative(e.timestamp)}</Caption1>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
