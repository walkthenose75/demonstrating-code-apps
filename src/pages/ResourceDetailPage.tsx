import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody, Link, Text, Caption1, Badge } from '@fluentui/react-components';
import { ArrowLeft16Regular, Open16Regular, ArrowRepeatAll16Regular, CalendarLtr16Regular } from '@fluentui/react-icons';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useCoverageAnalytics } from '@/hooks/useCoverageAnalytics';
import { projectsForResource } from '@/lib/analytics';
import { resourceTypeSet, maturitySet } from '@/lib/optionSets';
import { leadName } from '@/mockData/reference';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { OptionBadge } from '@/components/ui/OptionBadge';
import { PracticeAreaBadge } from '@/components/ui/PracticeAreaBadge';
import { LeadAvatar } from '@/components/ui/LeadAvatar';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' },
  body: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 32px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '16px 32px 0' },
  meta: { display: 'flex', flexDirection: 'column', gap: '16px' },
  badges: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' },
  cell: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { color: tokens.colorNeutralForeground3, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: tokens.fontWeightSemibold },
  value: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: tokens.fontWeightSemibold },
  desc: { color: tokens.colorNeutralForeground2 },
  row: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr 140px 180px',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  lead: { display: 'flex', alignItems: 'center', gap: '8px' },
  center: { display: 'grid', placeItems: 'center', padding: '48px' },
  empty: { padding: '24px', textAlign: 'center', color: tokens.colorNeutralForeground3 },
});

export function ResourceDetailPage() {
  const styles = useStyles();
  const { id } = useParams<{ id: string }>();
  const { isLoading, isError, topResources, projects, assignments } = useCoverageAnalytics();

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner label="Loading resource…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.body} style={{ paddingTop: 24 }}>
        <MessageBar intent="error">
          <MessageBarBody>Unable to load this resource. Please try again.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const resource = topResources.find((r) => r.id === id);

  if (!resource) {
    return (
      <div className={styles.body} style={{ paddingTop: 24 }}>
        <MessageBar intent="warning">
          <MessageBarBody>
            Resource not found. <RouterLink to="/resources">Back to the resource library</RouterLink>
          </MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const usedIn = projectsForResource(resource.id, assignments, projects);

  return (
    <div className={styles.page}>
      <RouterLink to="/resources" className={styles.back}>
        <ArrowLeft16Regular /> Resource Library
      </RouterLink>

      <PageHeader
        title={resource.name}
        subtitle={resource.description}
        actions={resource.isStale ? <Badge color="warning" appearance="tint" size="large">Stale</Badge> : undefined}
      />

      <div className={styles.body}>
        <SectionCard title="Overview">
          <div className={styles.meta}>
            <div className={styles.badges}>
              <OptionBadge set={resourceTypeSet} value={resource.resourceType} />
              <PracticeAreaBadge value={resource.practiceArea} />
              <OptionBadge set={maturitySet} value={resource.maturity} />
            </div>
            <div className={styles.grid}>
              <div className={styles.cell}>
                <Caption1 className={styles.label}>Owner</Caption1>
                <span className={styles.value}>
                  <LeadAvatar leadId={resource.owner} size={24} />
                  {leadName(resource.owner)}
                </span>
              </div>
              <div className={styles.cell}>
                <Caption1 className={styles.label}>Uses</Caption1>
                <span className={styles.value}><ArrowRepeatAll16Regular />{resource.reuse}</span>
              </div>
              <div className={styles.cell}>
                <Caption1 className={styles.label}>Last used</Caption1>
                <span className={styles.value}>
                  <CalendarLtr16Regular />
                  {resource.lastUsedOn ? formatDate(resource.lastUsedOn) : 'Never'}
                </span>
              </div>
              {resource.resourceUrl ? (
                <div className={styles.cell}>
                  <Caption1 className={styles.label}>Location</Caption1>
                  <Link href={resource.resourceUrl} target="_blank" rel="noreferrer">
                    Open resource <Open16Regular />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Used in these projects" subtitle={`${usedIn.length} ${usedIn.length === 1 ? 'project' : 'projects'}`}>
          {usedIn.length === 0 ? (
            <div className={styles.empty}>This resource has not been linked to any project yet.</div>
          ) : (
            usedIn.map((p) => (
              <div key={p.id} className={styles.row}>
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>{formatDate(p.startDate)}</Caption1>
                <Text weight="semibold">{p.name}</Text>
                <PracticeAreaBadge value={p.practiceArea} />
                <span className={styles.lead}>
                  <LeadAvatar leadId={p.projectLead} size={24} />
                  {leadName(p.projectLead)}
                </span>
              </div>
            ))
          )}
        </SectionCard>
      </div>
    </div>
  );
}
