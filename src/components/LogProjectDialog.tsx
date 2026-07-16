import { useState, useEffect } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  makeStyles,
  tokens,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Dropdown,
  Option,
  Caption1,
} from '@fluentui/react-components';
import type { DialogOpenChangeData, DialogOpenChangeEvent } from '@fluentui/react-components';
import { DataverseFieldLabel, useDataverseFieldRequired } from '@/components/ui/DataverseFieldLabel';
import { toDataverseFieldName } from '@/lib/dataverse-field-name';
import { practiceAreaSet, projectTypeSet } from '@/lib/optionSets';
import { mockClients, mockTeamMembers } from '@/mockData/reference';
import { useSaveProject } from '@/hooks/usePrototypeData';
import type { Project } from '@/types/domain-models';

const TABLE = 'pt_project';

const useStyles = makeStyles({
  form: { display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  input: {
    height: '32px',
    padding: '0 10px',
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    fontFamily: 'inherit',
    fontSize: tokens.fontSizeBase300,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
  },
  error: { color: tokens.colorPaletteRedForeground1 },
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog edits this project instead of creating a new one. */
  project?: Project | null;
}

interface FieldProps {
  field: string;
  label: string;
  children: (id: string, required: boolean) => ReactNode;
  error?: string;
}

function Field({ field, label, children, error }: FieldProps) {
  const styles = useStyles();
  const logical = toDataverseFieldName(field);
  const required = useDataverseFieldRequired(TABLE, logical);
  const id = `field-${field}`;
  return (
    <div className={styles.field}>
      <DataverseFieldLabel htmlFor={id} tableLogicalName={TABLE} fieldLogicalName={logical} fallback={label} />
      {children(id, required)}
      {error ? <Caption1 className={styles.error}>{error}</Caption1> : null}
    </div>
  );
}

export function LogProjectDialog({ open, onOpenChange, project }: Props) {
  const styles = useStyles();
  const save = useSaveProject();
  const isEdit = Boolean(project?.id);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [practiceArea, setPracticeArea] = useState<number | undefined>();
  const [client, setClient] = useState<string | undefined>();
  const [projectLead, setProjectLead] = useState<string | undefined>();
  const [projectType, setProjectType] = useState<number | undefined>();
  const [teamSize, setTeamSize] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  function reset() {
    setName('');
    setStartDate('');
    setPracticeArea(undefined);
    setClient(undefined);
    setProjectLead(undefined);
    setProjectType(undefined);
    setTeamSize('');
    setShowErrors(false);
  }

  // Prefill from the project when opening in edit mode; clear for a fresh create.
  useEffect(() => {
    if (!open) return;
    if (project) {
      setName(project.name ?? '');
      setStartDate(project.startDate ?? '');
      setPracticeArea(project.practiceArea);
      setClient(project.client);
      setProjectLead(project.projectLead);
      setProjectType(project.projectType);
      setTeamSize(project.teamSize !== undefined ? String(project.teamSize) : '');
      setShowErrors(false);
    } else {
      reset();
    }
  }, [open, project]);

  const missingName = !name.trim();
  const missingDate = !startDate;
  const missingArea = practiceArea === undefined;
  const missingClient = !client;
  // Client is a lookup we don't rewrite on edit (and may render as a display
  // name in connected mode), so only require it when creating a new project.
  const invalid = missingName || missingDate || missingArea || (!isEdit && missingClient);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (invalid) {
      setShowErrors(true);
      return;
    }
    await save.mutateAsync({
      id: isEdit ? project!.id : `project-${Date.now()}`,
      name: name.trim(),
      startDate,
      practiceArea: practiceArea!,
      client,
      projectLead,
      projectType,
      teamSize: teamSize ? Number(teamSize) : undefined,
      ...(isEdit ? {} : { resourceCount: 0 }),
    });
    reset();
    onOpenChange(false);
  }

  function handleOpenChange(_e: DialogOpenChangeEvent, data: DialogOpenChangeData) {
    if (!data.open) reset();
    onOpenChange(data.open);
  }

  const err = (show: boolean, msg: string) => (showErrors && show ? msg : undefined);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogSurface aria-describedby={undefined}>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>{isEdit ? 'Edit Project' : 'New Project'}</DialogTitle>
            <DialogContent>
              <div className={styles.form}>
                <Field field="name" label="Project Name" error={err(missingName, 'Project name is required.')}>
                  {(id, required) => (
                    <Input id={id} value={name} onChange={(_e, d) => setName(d.value)} aria-required={required || undefined} placeholder="e.g. NovaMed 510(k) submission program" />
                  )}
                </Field>

                <Field field="startdate" label="Start Date" error={err(missingDate, 'Start date is required.')}>
                  {(id, required) => (
                    <input id={id} type="date" className={styles.input} value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-required={required || undefined} />
                  )}
                </Field>

                <Field field="practicearea" label="Practice Area" error={err(missingArea, 'Practice area is required.')}>
                  {(id, required) => (
                    <Dropdown
                      id={id}
                      aria-required={required || undefined}
                      placeholder="Select a practice area"
                      selectedOptions={practiceArea !== undefined ? [String(practiceArea)] : []}
                      value={practiceAreaSet.options.find((o) => o.value === practiceArea)?.label ?? ''}
                      onOptionSelect={(_e, d) => setPracticeArea(d.optionValue ? Number(d.optionValue) : undefined)}
                    >
                      {practiceAreaSet.options.map((o) => (
                        <Option key={o.value} value={String(o.value)}>{o.label}</Option>
                      ))}
                    </Dropdown>
                  )}
                </Field>

                <Field field="client" label="Client" error={err(missingClient, 'Client is required.')}>
                  {(id, required) => (
                    <Dropdown
                      id={id}
                      aria-required={required || undefined}
                      placeholder="Select a client"
                      selectedOptions={client ? [client] : []}
                      value={mockClients.find((c) => c.id === client)?.name ?? ''}
                      onOptionSelect={(_e, d) => setClient(d.optionValue)}
                    >
                      {mockClients.map((c) => (
                        <Option key={c.id} value={c.id}>{c.name}</Option>
                      ))}
                    </Dropdown>
                  )}
                </Field>

                <Field field="projectlead" label="Project Lead">
                  {(id, required) => (
                    <Dropdown
                      id={id}
                      aria-required={required || undefined}
                      placeholder="Select a project lead"
                      selectedOptions={projectLead ? [projectLead] : []}
                      value={mockTeamMembers.find((s) => s.id === projectLead)?.name ?? ''}
                      onOptionSelect={(_e, d) => setProjectLead(d.optionValue)}
                    >
                      {mockTeamMembers.map((s) => (
                        <Option key={s.id} value={s.id}>{s.name}</Option>
                      ))}
                    </Dropdown>
                  )}
                </Field>

                <Field field="projecttype" label="Project Type">
                  {(id, required) => (
                    <Dropdown
                      id={id}
                      aria-required={required || undefined}
                      placeholder="Select a type"
                      selectedOptions={projectType !== undefined ? [String(projectType)] : []}
                      value={projectTypeSet.options.find((o) => o.value === projectType)?.label ?? ''}
                      onOptionSelect={(_e, d) => setProjectType(d.optionValue ? Number(d.optionValue) : undefined)}
                    >
                      {projectTypeSet.options.map((o) => (
                        <Option key={o.value} value={String(o.value)}>{o.label}</Option>
                      ))}
                    </Dropdown>
                  )}
                </Field>

                <Field field="teamsize" label="Team Size">
                  {(id, required) => (
                    <Input id={id} type="number" min={0} value={teamSize} onChange={(_e, d) => setTeamSize(d.value)} aria-required={required || undefined} placeholder="e.g. 8" />
                  )}
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button appearance="primary" type="submit" disabled={invalid || save.isPending}>
                {save.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
