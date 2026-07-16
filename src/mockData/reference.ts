// Reference data for lookups. In connected mode these are OOB Dataverse rows
// (account = Client, systemuser = Project Lead / Owner) resolved through the
// Office 365 Users / Dataverse connectors. In prototype mode they are seeded
// here so the UI can resolve lookup ids to display names and avatars.

export interface Client {
  id: string;
  name: string;
  /** Industry, purely for demo color/segmentation. */
  industry: string;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  /** Initials for avatar fallback. */
  initials: string;
}

export const mockClients: Client[] = [
  { id: 'acct-novamed', name: 'NovaMed Devices', industry: 'Medical Devices' },
  { id: 'acct-helixbio', name: 'Helix Biosciences', industry: 'Pharmaceuticals' },
  { id: 'acct-vitapharm', name: 'VitaPharm Labs', industry: 'Pharmaceuticals' },
  { id: 'acct-corewell', name: 'CoreWell Health', industry: 'Healthcare' },
  { id: 'acct-aterra', name: 'Aterra Manufacturing', industry: 'Manufacturing' },
  { id: 'acct-brightpath', name: 'BrightPath Financial', industry: 'Financial Services' },
  { id: 'acct-summit', name: 'Summit Retail Group', industry: 'Retail' },
  { id: 'acct-orbit', name: 'Orbit Logistics', industry: 'Logistics' },
  { id: 'acct-lumen', name: 'Lumen Software', industry: 'Software' },
  { id: 'acct-cascade', name: 'Cascade Foods', industry: 'Consumer Goods' },
  { id: 'acct-ironwood', name: 'Ironwood Energy', industry: 'Energy' },
  { id: 'acct-meridian', name: 'Meridian Insurance', industry: 'Insurance' },
];

export const mockTeamMembers: TeamMember[] = [
  { id: 'user-avery', name: 'Avery Diaz', title: 'Program Manager', initials: 'AD' },
  { id: 'user-jordan', name: 'Jordan Kim', title: 'Project Lead', initials: 'JK' },
  { id: 'user-priya', name: 'Priya Nair', title: 'Delivery Manager', initials: 'PN' },
  { id: 'user-marcus', name: 'Marcus Bailey', title: 'Project Manager', initials: 'MB' },
  { id: 'user-sofia', name: 'Sofia Rossi', title: 'Portfolio Lead', initials: 'SR' },
  { id: 'user-liam', name: 'Liam O’Brien', title: 'Project Lead', initials: 'LO' },
];

const clientsById = new Map(mockClients.map((c) => [c.id, c]));
const teamById = new Map(mockTeamMembers.map((m) => [m.id, m]));

export function clientName(id: string | undefined | null): string {
  return (id && clientsById.get(id)?.name) || 'Unknown client';
}

export function teamMember(id: string | undefined | null): TeamMember | undefined {
  return id ? teamById.get(id) : undefined;
}

export function leadName(id: string | undefined | null): string {
  return (id && teamById.get(id)?.name) || 'Unassigned';
}
