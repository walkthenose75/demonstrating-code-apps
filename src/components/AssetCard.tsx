import { makeStyles, tokens, Badge, Caption1, Text } from '@fluentui/react-components';
import { ArrowRepeatAll16Regular, CalendarLtr16Regular } from '@fluentui/react-icons';
import { Link } from 'react-router-dom';
import type { AssetStat } from '@/lib/analytics';
import { assetTypeSet, maturitySet } from '@/lib/optionSets';
import { formatDate } from '@/lib/format';
import { OptionBadge } from '@/components/ui/OptionBadge';
import { SolutionAreaBadge } from '@/components/ui/SolutionAreaBadge';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '18px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow2,
    minWidth: 0,
  },
  head: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' },
  name: {
    color: tokens.colorBrandForeground1,
    textDecoration: 'none',
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase400,
    ':hover': { textDecoration: 'underline' },
  },
  badges: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  desc: {
    color: tokens.colorNeutralForeground3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginTop: 'auto',
    paddingTop: '4px',
    color: tokens.colorNeutralForeground2,
  },
  meta: { display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: tokens.fontWeightSemibold },
});

export function AssetCard({ asset }: { asset: AssetStat }) {
  const styles = useStyles();
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <Link to={`/assets/${asset.id}`} className={styles.name}>{asset.name}</Link>
        {asset.isStale ? <Badge color="warning" appearance="tint">Stale</Badge> : null}
      </div>
      <div className={styles.badges}>
        <OptionBadge set={assetTypeSet} value={asset.assetType} />
        <SolutionAreaBadge value={asset.solutionArea} />
        <OptionBadge set={maturitySet} value={asset.maturity} />
      </div>
      {asset.description ? <Text className={styles.desc}>{asset.description}</Text> : null}
      <div className={styles.footer}>
        <span className={styles.meta}>
          <ArrowRepeatAll16Regular />
          {asset.reuse} {asset.reuse === 1 ? 'reuse' : 'reuses'}
        </span>
        <Caption1 style={{ color: tokens.colorNeutralForeground3, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <CalendarLtr16Regular />
          {asset.lastUsedOn ? formatDate(asset.lastUsedOn) : 'Never'}
        </Caption1>
      </div>
    </div>
  );
}
