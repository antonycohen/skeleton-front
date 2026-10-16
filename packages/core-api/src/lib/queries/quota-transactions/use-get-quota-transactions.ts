import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { ReadQuotaTransaction } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { GetQuotaTransactionsFilter } from '../../endpoints/quota-transactions';

export const getQuotaTransactions = async (
  params: GetCollectionQueryParams<
    ReadQuotaTransaction,
    GetQuotaTransactionsFilter
  >,
): Promise<ApiCollectionResponse<ReadQuotaTransaction>> => {
  return await skeletonApi.quotaTransactions.getQuotaTransactions(params);
};

export const useGetQuotaTransactions = (
  params: GetCollectionQueryParams<
    ReadQuotaTransaction,
    GetQuotaTransactionsFilter
  >,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<ReadQuotaTransaction>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['quota-transactions', params],
    queryFn: () => getQuotaTransactions(params),
    ...options,
  });
