import { Avatar } from '@fluentui/react-components';
import { teamMember } from '@/mockData/reference';

interface Props {
  leadId: string | undefined | null;
  size?: 20 | 24 | 28 | 32 | 36 | 40 | 48;
}

/** Avatar for a team member / system user, resolving initials from reference data. */
export function LeadAvatar({ leadId, size = 28 }: Props) {
  const m = teamMember(leadId);
  return <Avatar name={m?.name ?? 'Unassigned'} initials={m?.initials} size={size} color="colorful" />;
}
