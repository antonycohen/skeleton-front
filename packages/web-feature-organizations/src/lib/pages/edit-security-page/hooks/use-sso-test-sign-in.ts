import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  invalidateSsoQueries,
  useStartSsoConnectionTest,
} from '@skeleton/core-api';
import { ReadSsoConnection } from '@skeleton/core-api-models';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;
const POPUP_POLL_MS = 500;
/** The API's one-time link is good for ten minutes; after that there is no outcome left to wait for. */
const TEST_LINK_LIFETIME_MS = 10 * 60 * 1000;

/** The connection as it stood when the test was started: the outcome is what differs from this. */
type TestRun = {
  startedAt: number;
  status: string | null;
  lastTestedAt: string | null;
};

/**
 * Runs a test sign-in: asks the API for its one-time link and opens it in a popup, the way the
 * integration OAuth flows do. The test ends on a page of the backend portal, which tells nothing to
 * this window, so the outcome is read from the connection itself.
 *
 * Two things say "the admin is done with the popup", because neither is reliable on its own:
 *
 * - the popup being closed, polled. It is the precise signal, but only while the browser still
 *   holds the opener relation: an identity provider answering `Cross-Origin-Opener-Policy:
 *   same-origin` on any page of the way severs it, and `closed` then reads `true` at once — a
 *   refetch that comes far too early, and no signal at all when the test really ends;
 * - the main window coming back to the front (`focus`, `visibilitychange`), which is what happens
 *   when the popup is closed or simply left behind. It fires in the severed case too, so it is what
 *   makes the stepper move; it is watched from the start of the test until the connection is seen
 *   to change or the link's ten minutes are over, never longer.
 */
export function useSsoTestSignIn(
  organizationId: string,
  connection: Pick<ReadSsoConnection, 'status' | 'lastTestedAt'> | undefined,
) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const popupTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [testRun, setTestRun] = useState<TestRun | null>(null);

  // The connection as of the last render, read when a test starts. A ref, because the snapshot is
  // taken inside the mutation's callback and must not make the mutation options change identity.
  const connectionRef = useRef(connection);
  useEffect(() => {
    connectionRef.current = connection;
  }, [connection]);

  const stopWatchingPopup = useCallback(() => {
    if (popupTimer.current) {
      clearInterval(popupTimer.current);
      popupTimer.current = null;
    }
    setIsPopupOpen(false);
  }, []);

  // A popup left open when the admin leaves the page must not keep an interval alive.
  useEffect(() => stopWatchingPopup, [stopWatchingPopup]);

  const watchPopup = useCallback(
    (popup: Window) => {
      setIsPopupOpen(true);
      popupTimer.current = setInterval(() => {
        if (!popup.closed) return;
        stopWatchingPopup();
        invalidateSsoQueries(queryClient, organizationId);
      }, POPUP_POLL_MS);
    },
    [organizationId, queryClient, stopWatchingPopup],
  );

  // The outcome of the test is the connection changing: `tested` (or back to `draft` under it) and
  // a fresh `last_tested_at`. Seeing it is what ends the watch, whichever signal brought the read.
  const outcomeSeen =
    !!testRun &&
    ((connection?.status ?? null) !== testRun.status ||
      (connection?.lastTestedAt ?? null) !== testRun.lastTestedAt);
  const isWatchingForOutcome = !!testRun && !outcomeSeen;

  useEffect(() => {
    if (!testRun || !isWatchingForOutcome) return;

    const readConnectionAgain = () => {
      if (document.visibilityState !== 'visible') return;
      invalidateSsoQueries(queryClient, organizationId);
    };
    window.addEventListener('focus', readConnectionAgain);
    document.addEventListener('visibilitychange', readConnectionAgain);
    // Nothing can come of the link afterwards: stop listening rather than refetch on every
    // alt-tab for the rest of the session.
    const lapse = setTimeout(
      () => setTestRun(null),
      Math.max(0, testRun.startedAt + TEST_LINK_LIFETIME_MS - Date.now()),
    );

    return () => {
      window.removeEventListener('focus', readConnectionAgain);
      document.removeEventListener('visibilitychange', readConnectionAgain);
      clearTimeout(lapse);
    };
  }, [isWatchingForOutcome, organizationId, queryClient, testRun]);

  const startTest = useStartSsoConnectionTest({
    onSuccess: ({ url }) => {
      if (!url) return;
      const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
      const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;
      const popup = window.open(
        url,
        'sso-test-sign-in',
        `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},popup=yes`,
      );

      if (!popup) {
        // The link is good once and for ten minutes: say so rather than silently lose it.
        toast.error(t('security.sso.popupBlocked'));
        return;
      }
      setTestRun({
        startedAt: Date.now(),
        status: connectionRef.current?.status ?? null,
        lastTestedAt: connectionRef.current?.lastTestedAt ?? null,
      });
      watchPopup(popup);
    },
    // 409 while the connection is enabled or enforced, 404 while it does not exist: the API's
    // message says which, and a retry would not help.
    onError: (error) => toast.error(error.error),
  });

  return {
    startTest: () => startTest.mutate({ organizationId }),
    /**
     * True from the click until the popup is gone. It follows the popup alone, so a severed opener
     * relation ends it at the first poll instead of leaving a button spinning for ten minutes; the
     * watch above carries on quietly meanwhile.
     */
    isTesting: startTest.isPending || isPopupOpen,
  };
}
