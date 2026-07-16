import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody, Button, Input, Dropdown, Option, Text, Caption1, Dialog, DialogSurface, DialogTitle, DialogBody, DialogContent, DialogActions } from '@fluentui/react-components';
import { AddRegular, SearchRegular, EditRegular, DeleteRegular } from '@fluentui/react-icons';
import { useProjects, useDeleteProject } from '@/hooks/usePrototypeData';
import { filterProjects, isCovered } from '@/lib/analytics';
import type { ProjectFilter } from '@/lib/analytics';
import type { Project } from '@/types/domain-models';
import { practiceAreaSet, projectTypeSet } from '@/lib/optionSets';
import { clientName, leadName } from '@/mockData/reference';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { PracticeAreaBadge } from '@/components/ui/PracticeAreaBadge';
import { OptionBadge } from '@/components/ui/OptionBadge';
import { LeadAvatar } from '@/components/ui/LeadAvatar';
import { LogProjectDialog } from '@/components/LogProjectDialog';

const COVERAGE_LABELS: Record<NonNullable<ProjectFilter['coverage']>, string> = {
  all: 'All projects',
  covered: 'Resourced',
  story: 'At risk',
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
  lead: { display: 'flex', alignItems: 'center', gap: '8px' },
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
  rowActions: { display: 'flex', gap: '4px', justifyContent: 'flex-end' },
  nameLink: {
    color: tokens.colorBrandForeground1,
    textDecoration: 'none',
    fontWeight: tokens.fontWeightSemibold,
    ':hover': { textDecoration: 'underline' },
  },
});

export function ProjectsPage() {
  const styles = useStyles();
  const { data, isLoading, isError } = useProjects();
  const [open, setOpen] = useState(false);
  const [dialogProject, setDialogProject] = useState<Project | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const deleteProject = useDeleteProject();
  const [filter, setFilter] = useState<ProjectFilter>({ search: '', area: null, coverage: 'all' });

  const rows = useMemo(() => filterProjects(data ?? [], filter), [data, filter]);

  function openNew() {
    setDialogProject(null);
    setOpen(true);
  }

  function openEdit(project: Project) {
    setDialogProject(project);
    setOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await deleteProject.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Projects"
        subtitle="Every project in the portfolio and whether it is backed by a reusable resource"
        actions={
          <Button appearance="primary" icon={<AddRegular />} onClick={openNew}>
            New Project
          </Button>
        }
      />

      <div className={styles.body}>
        <div className={styles.filters}>
          <Input
            className={styles.search}
            contentBefore={<SearchRegular />}
            placeholder="Search projects by name"
            value={filter.search ?? ''}
            onChange={(_e, d) => setFilter((f) => ({ ...f, search: d.value }))}
          />
          <Dropdown
            placeholder="All areas"
            aria-label="Filter by practice area"
            selectedOptions={filter.area != null ? [String(filter.area)] : ['']}
            value={filter.area != null ? practiceAreaSet.options.find((o) => o.value === filter.area)?.label ?? '' : 'All areas'}
            onOptionSelect={(_e, d) => setFilter((f) => ({ ...f, area: d.optionValue ? Number(d.optionValue) : null }))}
          >
            <Option value="">All areas</Option>
            {practiceAreaSet.options.map((o) => (
              <Option key={o.value} value={String(o.value)}>{o.label}</Option>
            ))}
          </Dropdown>
          <Dropdown
            aria-label="Filter by coverage"
            selectedOptions={[filter.coverage ?? 'all']}
            value={COVERAGE_LABELS[filter.coverage ?? 'all']}
            onOptionSelect={(_e, d) => setFilter((f) => ({ ...f, coverage: (d.optionValue as ProjectFilter['coverage']) ?? 'all' }))}
          >
            {(Object.keys(COVERAGE_LABELS) as (keyof typeof COVERAGE_LABELS)[]).map((key) => (
              <Option key={key} value={key}>{COVERAGE_LABELS[key]}</Option>
            ))}
          </Dropdown>
        </div>

        <SectionCard title="Projects" subtitle={`${rows.length} of ${(data ?? []).length} shown`} flush>
          {isLoading ? (
            <div className={styles.center}>
              <Spinner label="Loading projects…" />
            </div>
          ) : isError ? (
            <div style={{ padding: '20px' }}>
              <MessageBar intent="error">
                <MessageBarBody>Unable to load projects. Please try again.</MessageBarBody>
              </MessageBar>
            </div>
          ) : rows.length === 0 ? (
            <div className={styles.empty}>No projects match your filters.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Project</th>
                  <th className={styles.th}>Start</th>
                  <th className={styles.th}>Area</th>
                  <th className={styles.th}>Type</th>
                  <th className={styles.th}>Lead</th>
                  <th className={styles.th}>Client</th>
                  <th className={styles.th}>Resources</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const covered = isCovered(p);
                  return (
                    <tr key={p.id}>
                      <td className={styles.td}>
                        <Link className={styles.nameLink} to={`/projects/${p.id}`}>{p.name}</Link>
                      </td>
                      <td className={styles.td}>{formatDate(p.startDate)}</td>
                      <td className={styles.td}><PracticeAreaBadge value={p.practiceArea} /></td>
                      <td className={styles.td}><OptionBadge set={projectTypeSet} value={p.projectType} /></td>
                      <td className={styles.td}>
                        <span className={styles.lead}>
                          <LeadAvatar leadId={p.projectLead} size={24} />
                          <span>{leadName(p.projectLead)}</span>
                        </span>
                      </td>
                      <td className={styles.td}>{clientName(p.client)}</td>
                      <td className={styles.td}>
                        <span
                          className={styles.chip}
                          style={
                            covered
                              ? { backgroundColor: '#107c1014', color: '#107c10' }
                              : { backgroundColor: tokens.colorNeutralBackground3, color: tokens.colorNeutralForeground3 }
                          }
                        >
                          {p.resourceCount ?? 0}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.rowActions}>
                          <Button
                            appearance="subtle"
                            size="small"
                            icon={<EditRegular />}
                            aria-label={`Edit ${p.name}`}
                            onClick={() => openEdit(p)}
                          />
                          <Button
                            appearance="subtle"
                            size="small"
                            icon={<DeleteRegular />}
                            aria-label={`Delete ${p.name}`}
                            onClick={() => setPendingDelete(p)}
                          />
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
          New projects start as at-risk until a resource is linked.
        </Caption1>
      </div>

      <LogProjectDialog open={open} onOpenChange={setOpen} project={dialogProject} />

      <Dialog open={pendingDelete !== null} onOpenChange={(_e, d) => { if (!d.open) setPendingDelete(null); }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogContent>
              <Text>
                This permanently deletes <Text weight="semibold">{pendingDelete?.name}</Text>. This action can’t be undone.
              </Text>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setPendingDelete(null)} disabled={deleteProject.isPending}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={confirmDelete} disabled={deleteProject.isPending}>
                {deleteProject.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
