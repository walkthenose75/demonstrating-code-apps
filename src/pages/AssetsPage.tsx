import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { useCoverageAnalytics } from '@/hooks/useCoverageAnalytics';
import { PageHeader } from '@/components/ui/PageHeader';
import { AssetCard } from '@/components/AssetCard';

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

export function AssetsPage() {
  const styles = useStyles();
  const { isLoading, isError, topAssets } = useCoverageAnalytics();

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner label="Loading asset catalog…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.message} style={{ paddingTop: 24 }}>
        <MessageBar intent="error">
          <MessageBarBody>Unable to load the asset catalog. Please try again.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Asset Catalog"
        subtitle="Reusable demo assets, ranked by how many deliveries they have backed"
      />
      {topAssets.length === 0 ? (
        <div className={styles.empty}>No assets in the catalog yet.</div>
      ) : (
        <div className={styles.grid}>
          {topAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
