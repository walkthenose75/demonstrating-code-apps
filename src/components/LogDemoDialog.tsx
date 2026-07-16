import { useState } from 'react';
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
import { solutionAreaSet, deliveryFormatSet } from '@/lib/optionSets';
import { mockCustomers, mockSellers } from '@/mockData/reference';
import { useSaveDemoDelivery } from '@/hooks/usePrototypeData';

const TABLE = 'dat_demodelivery';

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

export function LogDemoDialog({ open, onOpenChange }: Props) {
  const styles = useStyles();
  const save = useSaveDemoDelivery();

  const [name, setName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [solutionArea, setSolutionArea] = useState<number | undefined>();
  const [customer, setCustomer] = useState<string | undefined>();
  const [presenter, setPresenter] = useState<string | undefined>();
  const [deliveryFormat, setDeliveryFormat] = useState<number | undefined>();
  const [audienceSize, setAudienceSize] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  function reset() {
    setName('');
    setDeliveryDate('');
    setSolutionArea(undefined);
    setCustomer(undefined);
    setPresenter(undefined);
    setDeliveryFormat(undefined);
    setAudienceSize('');
    setShowErrors(false);
  }

  const missingName = !name.trim();
  const missingDate = !deliveryDate;
  const missingArea = solutionArea === undefined;
  const missingCustomer = !customer;
  const invalid = missingName || missingDate || missingArea || missingCustomer;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (invalid) {
      setShowErrors(true);
      return;
    }
    await save.mutateAsync({
      id: `delivery-${Date.now()}`,
      name: name.trim(),
      deliveryDate,
      solutionArea: solutionArea!,
      customer,
      presenter,
      deliveryFormat,
      audienceSize: audienceSize ? Number(audienceSize) : undefined,
      linkedAssetCount: 0,
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
            <DialogTitle>Log a Demo</DialogTitle>
            <DialogContent>
              <div className={styles.form}>
                <Field field="name" label="Delivery Name" error={err(missingName, 'Delivery name is required.')}>
                  {(id, required) => (
                    <Input id={id} value={name} onChange={(_e, d) => setName(d.value)} aria-required={required || undefined} placeholder="e.g. Contoso Azure Landing Zone demo" />
                  )}
                </Field>

                <Field field="deliverydate" label="Delivery Date" error={err(missingDate, 'Delivery date is required.')}>
                  {(id, required) => (
                    <input id={id} type="date" className={styles.input} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} aria-required={required || undefined} />
                  )}
                </Field>

                <Field field="solutionarea" label="Solution Area" error={err(missingArea, 'Solution area is required.')}>
                  {(id, required) => (
                    <Dropdown
                      id={id}
                      aria-required={required || undefined}
                      placeholder="Select a solution area"
                      selectedOptions={solutionArea !== undefined ? [String(solutionArea)] : []}
                      value={solutionAreaSet.options.find((o) => o.value === solutionArea)?.label ?? ''}
                      onOptionSelect={(_e, d) => setSolutionArea(d.optionValue ? Number(d.optionValue) : undefined)}
                    >
                      {solutionAreaSet.options.map((o) => (
                        <Option key={o.value} value={String(o.value)}>{o.label}</Option>
                      ))}
                    </Dropdown>
                  )}
                </Field>

                <Field field="customer" label="Customer" error={err(missingCustomer, 'Customer is required.')}>
                  {(id, required) => (
                    <Dropdown
                      id={id}
                      aria-required={required || undefined}
                      placeholder="Select a customer"
                      selectedOptions={customer ? [customer] : []}
                      value={mockCustomers.find((c) => c.id === customer)?.name ?? ''}
                      onOptionSelect={(_e, d) => setCustomer(d.optionValue)}
                    >
                      {mockCustomers.map((c) => (
                        <Option key={c.id} value={c.id}>{c.name}</Option>
                      ))}
                    </Dropdown>
                  )}
                </Field>

                <Field field="presenter" label="Presenter">
                  {(id, required) => (
                    <Dropdown
                      id={id}
                      aria-required={required || undefined}
                      placeholder="Select a presenter"
                      selectedOptions={presenter ? [presenter] : []}
                      value={mockSellers.find((s) => s.id === presenter)?.name ?? ''}
                      onOptionSelect={(_e, d) => setPresenter(d.optionValue)}
                    >
                      {mockSellers.map((s) => (
                        <Option key={s.id} value={s.id}>{s.name}</Option>
                      ))}
                    </Dropdown>
                  )}
                </Field>

                <Field field="deliveryformat" label="Delivery Format">
                  {(id, required) => (
                    <Dropdown
                      id={id}
                      aria-required={required || undefined}
                      placeholder="Select a format"
                      selectedOptions={deliveryFormat !== undefined ? [String(deliveryFormat)] : []}
                      value={deliveryFormatSet.options.find((o) => o.value === deliveryFormat)?.label ?? ''}
                      onOptionSelect={(_e, d) => setDeliveryFormat(d.optionValue ? Number(d.optionValue) : undefined)}
                    >
                      {deliveryFormatSet.options.map((o) => (
                        <Option key={o.value} value={String(o.value)}>{o.label}</Option>
                      ))}
                    </Dropdown>
                  )}
                </Field>

                <Field field="audiencesize" label="Audience Size">
                  {(id, required) => (
                    <Input id={id} type="number" min={0} value={audienceSize} onChange={(_e, d) => setAudienceSize(d.value)} aria-required={required || undefined} placeholder="e.g. 12" />
                  )}
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button appearance="primary" type="submit" disabled={invalid || save.isPending}>
                {save.isPending ? 'Saving…' : 'Log delivery'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
