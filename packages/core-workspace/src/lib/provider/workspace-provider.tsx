import React, {PropsWithChildren, ReactNode, useEffect} from 'react';
import {Organization, readOrganizationSchema} from '@skeleton/core-api-models';
import {ApiError, useGetOrganizationById} from '@skeleton/core-api';
import {useWorkspaceStore} from '@skeleton/core-store-workspace';
import {z} from 'zod';

function createEmptyShape<T extends z.ZodObject<z.ZodRawShape>>(schema: T): z.infer<T> {
  const shape = schema.shape;
  const result: Record<string, null> = {};
  for (const key of Object.keys(shape)) {
    result[key] = null;
  }
  return result as z.infer<T>;
}

type UserOrganizationsProviderType = {
  selectedWorkspaceId: string ;
  getCurrentWorkspaceUrlPrefix: () => string;
  currentOrganization: Organization;
};

export const WorkspaceContext =
  React.createContext<UserOrganizationsProviderType>({
    selectedWorkspaceId: '',
    currentOrganization: createEmptyShape(readOrganizationSchema),
    getCurrentWorkspaceUrlPrefix: () => {
      return '/w';
    },
  });

type WorkspaceProviderProps = PropsWithChildren<{
  selectedWorkspaceId: string | null;
  /**
   * Rendered instead of the children when the workspace is refused (403) or unknown (404): the
   * person lost access to it, or the URL is wrong. Without it, the children render as before.
   */
  unavailable?: ReactNode;
}>;

/** A refusal is an answer: asking again cannot change it, and would hold the page for seconds. */
const isRefusal = (error: unknown) =>
  error instanceof ApiError && (error.httpCode === 403 || error.httpCode === 404);

export const WorkspaceProvider = (props: WorkspaceProviderProps) => {
  const setWorkspaceId = useWorkspaceStore((state) => state.setWorkspaceId);

  useEffect(() => {
    setWorkspaceId(props.selectedWorkspaceId);
    return () => setWorkspaceId(null);
  }, [props.selectedWorkspaceId, setWorkspaceId]);

  const { data: currentOrganization, isFetched, error } = useGetOrganizationById({
    id: props.selectedWorkspaceId as string,
    fields: {
      id: null,
      name: null,
      type: null,
      createdAt: null,
      updatedAt: null,
      activeQuotas: {
        fields: {
          quotaLimit: null,
          remainingQuota: null,
          featureKey: null,
          feature: {
            fields: {
              id: null,
              lookupKey: null,
              displayName: null,
            }
          },
          currentUsage: null,
          periodEnd: null,
          periodStart: null,
        }
      },
      subscription: {
        fields: {
          id: null,
          status: null,
          cancelAt: null,
          startDate: null,
          endedAt: null,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          items: {
            fields: {
              price: {
                fields: {
                  currency: null,
                  unitAmountInCents: null,
                  recurringIntervalCount: null,
                  recurringInterval: null,
                }
              }
            }
          },
          productGroup: {
            fields: {
              id: null,
              name: null,
            }
          },
          // Drives the past-due invoice banner.
          latestInvoice: {
            fields: {
              id: null,
              status: null,
              amountDue: null,
              amountRemaining: null,
              currency: null,
              dueDate: null,
              hostedInvoiceUrl: null,
            }
          }
        }
      }
    }
  }, {
    enabled: props.selectedWorkspaceId !== null,
    retry: (failureCount, error) => !isRefusal(error) && failureCount < 3,
  });

  if (props.unavailable !== undefined && isRefusal(error)) {
    return <>{props.unavailable}</>;
  }

  return (
    <WorkspaceContext.Provider
      value={{
        currentOrganization: currentOrganization || createEmptyShape(readOrganizationSchema),
        selectedWorkspaceId: props.selectedWorkspaceId ?? '',
        getCurrentWorkspaceUrlPrefix: () => {
          return `/w/${props.selectedWorkspaceId ?? ''}`;
        },
      }}
    >
      {isFetched && (props.children)}
    </WorkspaceContext.Provider>
  );
};

export const useCurrentWorkspaceUrlPrefix = () => {
  return React.useContext(WorkspaceContext).getCurrentWorkspaceUrlPrefix();
};

export const useGetCurrentWorkspaceId = () => {
  return React.useContext(WorkspaceContext).selectedWorkspaceId;
};

export const useCurrentOrganization = () => {
  return React.useContext(WorkspaceContext).currentOrganization;
}

export const useGetCurrentQuotas = () => {
  const { activeQuotas } = React.useContext(WorkspaceContext).currentOrganization;
  return {
    quotas: activeQuotas ?? [],
    getQuota: (featureKey: string) => activeQuotas?.find(q => q.featureKey === featureKey),
  };
}
