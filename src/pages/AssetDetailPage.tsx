import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody, Link, Text, Caption1, Badge } from '@fluentui/react-components';
import { ArrowLeft16Regular, Open16Regular, ArrowRepeatAll16Regular, CalendarLtr16Regular } from '@fluentui/react-icons';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useCoverageAnalytics } from '@/hooks/useCoverageAnalytics';
import { deliveriesForAsset } from '@/lib/analytics';
import { assetTypeSet, maturitySet } from '@/lib/optionSets';
import { sellerName } from '@/mockData/reference';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { OptionBadge } from '@/components/ui/OptionBadge';
import { SolutionAreaBadge } from '@/components/ui/SolutionAreaBadge';
import { SellerAvatar } from '@/components/ui/SellerAvatar';

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
  presenter: { display: 'flex', alignItems: 'center', gap: '8px' },
  center: { display: 'grid', placeItems: 'center', padding: '48px' },
  empty: { padding: '24px', textAlign: 'center', color: tokens.colorNeutralForeground3 },
});

export function AssetDetailPage() {
  const styles = useStyles();
  const { id } = useParams<{ id: string }>();
  const { isLoading, isError, topAssets, deliveries, usages } = useCoverageAnalytics();

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner label="Loading asset…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.body} style={{ paddingTop: 24 }}>
        <MessageBar intent="error">
          <MessageBarBody>Unable to load this asset. Please try again.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const asset = topAssets.find((a) => a.id === id);

  if (!asset) {
    return (
      <div className={styles.body} style={{ paddingTop: 24 }}>
        <MessageBar intent="warning">
          <MessageBarBody>
            Asset not found. <RouterLink to="/assets">Back to the asset catalog</RouterLink>
          </MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const usedIn = deliveriesForAsset(asset.id, usages, deliveries);

  return (
    <div className={styles.page}>
      <RouterLink to="/assets" className={styles.back}>
        <ArrowLeft16Regular /> Asset Catalog
      </RouterLink>

      <PageHeader
        title={asset.name}
        subtitle={asset.description}
        actions={asset.isStale ? <Badge color="warning" appearance="tint" size="large">Stale</Badge> : undefined}
      />

      <div className={styles.body}>
        <SectionCard title="Overview">
          <div className={styles.meta}>
            <div className={styles.badges}>
              <OptionBadge set={assetTypeSet} value={asset.assetType} />
              <SolutionAreaBadge value={asset.solutionArea} />
              <OptionBadge set={maturitySet} value={asset.maturity} />
            </div>
            <div className={styles.grid}>
              <div className={styles.cell}>
                <Caption1 className={styles.label}>Maintainer</Caption1>
                <span className={styles.value}>
                  <SellerAvatar sellerId={asset.maintainer} size={24} />
                  {sellerName(asset.maintainer)}
                </span>
              </div>
              <div className={styles.cell}>
                <Caption1 className={styles.label}>Reuse</Caption1>
                <span className={styles.value}><ArrowRepeatAll16Regular />{asset.reuse}</span>
              </div>
              <div className={styles.cell}>
                <Caption1 className={styles.label}>Last used</Caption1>
                <span className={styles.value}>
                  <CalendarLtr16Regular />
                  {asset.lastUsedOn ? formatDate(asset.lastUsedOn) : 'Never'}
                </span>
              </div>
              {asset.assetUrl ? (
                <div className={styles.cell}>
                  <Caption1 className={styles.label}>Location</Caption1>
                  <Link href={asset.assetUrl} target="_blank" rel="noreferrer">
                    Open asset <Open16Regular />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Used in these deliveries" subtitle={`${usedIn.length} ${usedIn.length === 1 ? 'delivery' : 'deliveries'}`}>
          {usedIn.length === 0 ? (
            <div className={styles.empty}>This asset has not been linked to any delivery yet.</div>
          ) : (
            usedIn.map((d) => (
              <div key={d.id} className={styles.row}>
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>{formatDate(d.deliveryDate)}</Caption1>
                <Text weight="semibold">{d.name}</Text>
                <SolutionAreaBadge value={d.solutionArea} />
                <span className={styles.presenter}>
                  <SellerAvatar sellerId={d.presenter} size={24} />
                  {sellerName(d.presenter)}
                </span>
              </div>
            ))
          )}
        </SectionCard>
      </div>
    </div>
  );
}
