import { practiceAreaSet } from '@/lib/optionSets';
import { OptionBadge } from '@/components/ui/OptionBadge';

/** Convenience wrapper: an OptionBadge bound to the Practice Area set. */
export function PracticeAreaBadge({ value }: { value: number | undefined | null }) {
  return <OptionBadge set={practiceAreaSet} value={value} />;
}
