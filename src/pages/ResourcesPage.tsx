import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { useCoverageAnalytics } from '@/hooks/useCoverageAnalytics';
import { PageHeader } from '@/components/ui/PageHeader';
import { ResourceCard } from '@/components/ResourceCard';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    padding: '0 32px',
  },
  center: { display: 'grid', placeItems: 'center', padding: '48px' },
  message: { padding: '0 32px' },
  empty: { padding: '48px 32px', color: tokens.colorNeutralForeground3 },
});

export function ResourcesPage() {
  const styles = useStyles();
  const { isLoading, isError, topResources } = useCoverageAnalytics();

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner label="Loading resource library…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.message} style={{ paddingTop: 24 }}>
        <MessageBar intent="error">
          <MessageBarBody>Unable to load the resource library. Please try again.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Resource Library"
        subtitle="Reusable resources, ranked by how many projects they have backed"
      />
      {topResources.length === 0 ? (
        <div className={styles.empty}>No resources in the library yet.</div>
      ) : (
        <div className={styles.grid}>
          {topResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}
