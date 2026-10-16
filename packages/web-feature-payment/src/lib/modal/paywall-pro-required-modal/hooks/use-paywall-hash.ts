import {useCallback, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

export type PaywallReason = 'role' | 'quota_exceeded' | 'sso';

/**
 * Reasons no self-serve plan covers: the paywall states what is missing and sends the admin to
 * sales instead of to a checkout.
 */
const SALES_ONLY_REASONS: ReadonlySet<string> = new Set<PaywallReason>(['sso']);

/** Where "Talk to sales" goes. */
export const ENTERPRISE_SALES_URL: string =
  import.meta.env['VITE_SALES_URL'] || 'mailto:sales@example.com';

export type HashParams = {
  reason?: string;
  /** Feature key of the exhausted quota, for `quota_exceeded`. */
  quota?: string;
};

export function parseHash(hash: string, hashKey: string): HashParams | null {
  if (!hash.startsWith(`#${hashKey}`)) return null;

  const params = new URLSearchParams(hash.slice(hashKey.length + 2));
  return {
    reason: params.get('reason') || undefined,
    quota: params.get('quota') || undefined,
  };
}

export function usePaywallHash(hashKey: string) {
  const location = useLocation();

  const hashParams = useMemo(() => {
    return parseHash(location.hash, hashKey);
  }, [location.hash, hashKey]);

  const isOpen = hashParams !== null;
  const isQuotaExceeded = hashParams?.reason === 'quota_exceeded';
  const showPlanSummary = isQuotaExceeded;
  const isSalesOnly = !!hashParams?.reason && SALES_ONLY_REASONS.has(hashParams.reason);

  return { hashParams, isOpen, isQuotaExceeded, showPlanSummary, isSalesOnly };
}

export type UseOpenPaywallOptions = {
  hashKey?: string;
};

export function useOpenPaywall({ hashKey = 'paywall-pro' }: UseOpenPaywallOptions = {}) {
  const navigate = useNavigate();

  const openPaywall = useCallback(
    (reason?: PaywallReason, params?: Record<string, string>) => {
      const searchParams = new URLSearchParams();
      if (reason) searchParams.set('reason', reason);
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          searchParams.set(key, value);
        }
      }
      const query = searchParams.toString();
      const hash = query ? `${hashKey}?${query}` : hashKey;
      navigate({ hash }, { replace: true });
    },
    [navigate, hashKey]
  );

  const closePaywall = useCallback(() => {
    navigate({ hash: '' }, { replace: true });
  }, [navigate]);

  return { openPaywall, closePaywall };
}
