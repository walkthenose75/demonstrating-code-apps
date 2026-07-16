import { useQuery } from '@tanstack/react-query';
import { fieldMetadataRepository } from '@/services/fieldMetadata';

export function useDataverseFieldMetadata(tableLogicalName: string, fieldLogicalName: string) {
  return useQuery({
    queryKey: ['fieldMetadata', tableLogicalName, fieldLogicalName],
    enabled: Boolean(tableLogicalName) && Boolean(fieldLogicalName),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    queryFn: () => fieldMetadataRepository.getField(tableLogicalName, fieldLogicalName),
  });
}
