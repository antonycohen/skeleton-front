import { ReadCustomer } from '@skeleton/core-api-models';
import { ApiError } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getCustomers } from './use-get-customers';

const PAGE_SIZE = 200;

// The API has no organization filter on customers: page through the whole
// collection and match on the nested organization id.
export const findCustomerByOrganizationId = async (
  organizationId: string,
): Promise<ReadCustomer | null> => {
  let offset = 0;
  for (;;) {
    const page = await getCustomers({
      fields: {
        id: null,
        name: null,
        email: null,
        organization: { fields: { id: null } },
      },
      limit: PAGE_SIZE,
      offset,
    });
    const match = page.data.find(
      (candidate) => candidate.organization?.id === organizationId,
    );
    if (match) return match;
    offset += PAGE_SIZE;
    const total = page.pagination.count;
    if (
      page.data.length < PAGE_SIZE ||
      (Number.isFinite(total) && offset >= total)
    ) {
      return null;
    }
  }
};

export const useGetCustomerByOrganizationId = (
  organizationId: string,
  options?: Omit<UseQueryOptions<ReadCustomer | null, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['customers', 'by-organization', organizationId],
    queryFn: () => findCustomerByOrganizationId(organizationId),
    ...options,
  });
