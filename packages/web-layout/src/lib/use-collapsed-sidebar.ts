import {useEffect, useRef} from 'react';
import {useSidebar} from '@skeleton/web-components';

/**
 * Collapses the sidebar to its icon rail while the calling view is mounted
 * (the studio, the funnels, the variant preview) and restores the previous
 * state on unmount. No-op on mobile, where the sidebar is an off-canvas sheet.
 */
export function useCollapsedSidebar(enabled = true) {
  const { open, setOpen, isMobile } = useSidebar();
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    if (!enabled || isMobile) return;
    const previous = openRef.current;
    setOpen(false);
    return () => setOpen(previous);
    // `setOpen` changes identity with `open`; this must only run on mount/unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isMobile]);
}
