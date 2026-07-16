import { useState, useMemo } from 'react';
import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody, Button, Input, Dropdown, Option, Text, Caption1 } from '@fluentui/react-components';
import { AddRegular, SearchRegular } from '@fluentui/react-icons';
import { useDemoDeliveries } from '@/hooks/usePrototypeData';
import { filterDeliveries, isCovered } from '@/lib/analytics';
import type { DeliveryFilter } from '@/lib/analytics';
import { solutionAreaSet, deliveryFormatSet } from '@/lib/optionSets';
import { customerName, sellerName } from '@/mockData/reference';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { SolutionAreaBadge } from '@/components/ui/SolutionAreaBadge';
import { OptionBadge } from '@/components/ui/OptionBadge';
import { SellerAvatar } from '@/components/ui/SellerAvatar';
import { LogDemoDialog } from '@/components/LogDemoDialog';

const COVERAGE_LABELS: Record<NonNullable<DeliveryFilter['coverage']>, string> = {
  all: 'All deliveries',
  covered: 'Asset-backed',
  story: 'Story only',
};

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' },
  body: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 32px' },
  filters: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  search: { minWidth: '240px', flex: 1 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: tokens.fontSizeBase300 },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: tokens.fontSizeBase200,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
  },
  td: { padding: '12px 14px', borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, verticalAlign: 'middle' },
  presenter: { display: 'flex', alignItems: 'center', gap: '8px' },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: tokens.borderRadiusCircular,
    padding: '3px 10px',
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    fontVariantNumeric: 'tabular-nums',
  },
  empty: { padding: '48px', textAlign: 'center', color: tokens.colorNeutralForeground3 },
  center: { display: 'grid', placeItems: 'center', padding: '48px' },
});

export function DeliveriesPage() {
  const styles = useStyles();
  const { data, isLoading, isError } = useDemoDeliveries();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<DeliveryFilter>({ search: '', area: null, coverage: 'all' });

  const rows = useMemo(() => filterDeliveries(data ?? [], filter), [data, filter]);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Deliveries"
        subtitle="Every logged demo delivery and whether it is backed by a reusable asset"
        actions={
          <Button appearance="primary" icon={<AddRegular />} onClick={() => setOpen(true)}>
            Log a Demo
          </Button>
        }
      />

      <div className={styles.body}>
        <div className={styles.filters}>
          <Input
            className={styles.search}
            contentBefore={<SearchRegular />}
            placeholder="Search deliveries by name"
            value={filter.search ?? ''}
            onChange={(_e, d) => setFilter((f) => ({ ...f, search: d.value }))}
          />
          <Dropdown
            placeholder="All areas"
            aria-label="Filter by solution area"
            selectedOptions={filter.area != null ? [String(filter.area)] : ['']}
            value={filter.area != null ? solutionAreaSet.options.find((o) => o.value === filter.area)?.label ?? '' : 'All areas'}
            onOptionSelect={(_e, d) => setFilter((f) => ({ ...f, area: d.optionValue ? Number(d.optionValue) : null }))}
          >
            <Option value="">All areas</Option>
            {solutionAreaSet.options.map((o) => (
              <Option key={o.value} value={String(o.value)}>{o.label}</Option>
            ))}
          </Dropdown>
          <Dropdown
            aria-label="Filter by coverage"
            selectedOptions={[filter.coverage ?? 'all']}
            value={COVERAGE_LABELS[filter.coverage ?? 'all']}
            onOptionSelect={(_e, d) => setFilter((f) => ({ ...f, coverage: (d.optionValue as DeliveryFilter['coverage']) ?? 'all' }))}
          >
            {(Object.keys(COVERAGE_LABELS) as (keyof typeof COVERAGE_LABELS)[]).map((key) => (
              <Option key={key} value={key}>{COVERAGE_LABELS[key]}</Option>
            ))}
          </Dropdown>
        </div>

        <SectionCard title="Deliveries" subtitle={`${rows.length} of ${(data ?? []).length} shown`} flush>
          {isLoading ? (
            <div className={styles.center}>
              <Spinner label="Loading deliveries…" />
            </div>
          ) : isError ? (
            <div style={{ padding: '20px' }}>
              <MessageBar intent="error">
                <MessageBarBody>Unable to load deliveries. Please try again.</MessageBarBody>
              </MessageBar>
            </div>
          ) : rows.length === 0 ? (
            <div className={styles.empty}>No deliveries match your filters.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Delivery</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Area</th>
                  <th className={styles.th}>Format</th>
                  <th className={styles.th}>Presenter</th>
                  <th className={styles.th}>Customer</th>
                  <th className={styles.th}>Assets</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => {
                  const covered = isCovered(d);
                  return (
                    <tr key={d.id}>
                      <td className={styles.td}><Text weight="semibold">{d.name}</Text></td>
                      <td className={styles.td}>{formatDate(d.deliveryDate)}</td>
                      <td className={styles.td}><SolutionAreaBadge value={d.solutionArea} /></td>
                      <td className={styles.td}><OptionBadge set={deliveryFormatSet} value={d.deliveryFormat} /></td>
                      <td className={styles.td}>
                        <span className={styles.presenter}>
                          <SellerAvatar sellerId={d.presenter} size={24} />
                          <span>{sellerName(d.presenter)}</span>
                        </span>
                      </td>
                      <td className={styles.td}>{customerName(d.customer)}</td>
                      <td className={styles.td}>
                        <span
                          className={styles.chip}
                          style={
                            covered
                              ? { backgroundColor: '#107c1014', color: '#107c10' }
                              : { backgroundColor: tokens.colorNeutralBackground3, color: tokens.colorNeutralForeground3 }
                          }
                        >
                          {d.linkedAssetCount ?? 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </SectionCard>

        <Caption1 style={{ color: tokens.colorNeutralForeground4, padding: '0 4px' }}>
          New deliveries start as story-only until an asset is linked.
        </Caption1>
      </div>

      <LogDemoDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
