// Reference data for lookups. In connected mode these are OOB Dataverse rows
// (account = Customer, systemuser = Seller/Presenter/Maintainer) resolved through
// the Office 365 Users / Dataverse connectors. In prototype mode they are seeded
// here so the UI can resolve lookup ids to display names and avatars.

export interface Customer {
  id: string;
  name: string;
  /** Industry, purely for demo color/segmentation. */
  industry: string;
}

export interface Seller {
  id: string;
  name: string;
  title: string;
  /** Initials for avatar fallback. */
  initials: string;
}

export const mockCustomers: Customer[] = [
  { id: 'acct-contoso', name: 'Contoso Ltd', industry: 'Manufacturing' },
  { id: 'acct-fabrikam', name: 'Fabrikam Inc', industry: 'Retail' },
  { id: 'acct-tailwind', name: 'Tailwind Traders', industry: 'Retail' },
  { id: 'acct-northwind', name: 'Northwind Traders', industry: 'Distribution' },
  { id: 'acct-adventure', name: 'Adventure Works', industry: 'Manufacturing' },
  { id: 'acct-woodgrove', name: 'Woodgrove Bank', industry: 'Financial Services' },
  { id: 'acct-proseware', name: 'Proseware, Inc.', industry: 'Software' },
  { id: 'acct-fourthcoffee', name: 'Fourth Coffee', industry: 'Hospitality' },
  { id: 'acct-litware', name: 'Litware, Inc.', industry: 'Software' },
  { id: 'acct-margie', name: 'Margie’s Travel', industry: 'Travel' },
  { id: 'acct-alpine', name: 'Alpine Ski House', industry: 'Hospitality' },
  { id: 'acct-relecloud', name: 'Relecloud', industry: 'Media' },
];

export const mockSellers: Seller[] = [
  { id: 'user-avery', name: 'Avery Diaz', title: 'Senior Solution Engineer', initials: 'AD' },
  { id: 'user-jordan', name: 'Jordan Kim', title: 'Cloud Solution Architect', initials: 'JK' },
  { id: 'user-priya', name: 'Priya Nair', title: 'Technical Specialist', initials: 'PN' },
  { id: 'user-marcus', name: 'Marcus Bailey', title: 'Solution Engineer', initials: 'MB' },
  { id: 'user-sofia', name: 'Sofia Rossi', title: 'Principal Solution Engineer', initials: 'SR' },
  { id: 'user-liam', name: 'Liam O’Brien', title: 'Security Specialist', initials: 'LO' },
];

const customersById = new Map(mockCustomers.map((c) => [c.id, c]));
const sellersById = new Map(mockSellers.map((s) => [s.id, s]));

export function customerName(id: string | undefined | null): string {
  return (id && customersById.get(id)?.name) || 'Unknown customer';
}

export function seller(id: string | undefined | null): Seller | undefined {
  return id ? sellersById.get(id) : undefined;
}

export function sellerName(id: string | undefined | null): string {
  return (id && sellersById.get(id)?.name) || 'Unassigned';
}
