import { Avatar } from '@fluentui/react-components';
import { seller } from '@/mockData/reference';

interface Props {
  sellerId: string | undefined | null;
  size?: 20 | 24 | 28 | 32 | 36 | 40 | 48;
}

/** Avatar for a seller/system user, resolving initials from reference data. */
export function SellerAvatar({ sellerId, size = 28 }: Props) {
  const s = seller(sellerId);
  return <Avatar name={s?.name ?? 'Unassigned'} initials={s?.initials} size={size} color="colorful" />;
}
