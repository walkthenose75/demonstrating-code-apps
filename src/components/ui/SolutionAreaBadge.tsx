import { solutionAreaSet } from '@/lib/optionSets';
import { OptionBadge } from '@/components/ui/OptionBadge';

/** Convenience wrapper: an OptionBadge bound to the Solution Area set. */
export function SolutionAreaBadge({ value }: { value: number | undefined | null }) {
  return <OptionBadge set={solutionAreaSet} value={value} />;
}
