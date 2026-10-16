import {createContext, type ReactNode, useContext, useEffect, useMemo, useState} from 'react';

type SidebarVisibility = {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
};

const SidebarVisibilityContext = createContext<SidebarVisibility | null>(null);

/** Holds whether the app sidebar is rendered at all (see useHiddenSidebar). */
export function SidebarVisibilityProvider({children}: {children: ReactNode}) {
  const [hidden, setHidden] = useState(false);
  const value = useMemo(() => ({hidden, setHidden}), [hidden]);
  return (
    <SidebarVisibilityContext.Provider value={value}>{children}</SidebarVisibilityContext.Provider>
  );
}

export function useSidebarVisibility(): SidebarVisibility {
  const context = useContext(SidebarVisibilityContext);
  // Outside the user layout (tests, previews) there is no sidebar to hide.
  return context ?? {hidden: false, setHidden: () => undefined};
}

/**
 * Removes the sidebar entirely while the calling view is mounted — not the
 * icon rail of useCollapsedSidebar, no sidebar at all (the landing-page
 * building screen) — and brings it back on unmount.
 */
export function useHiddenSidebar(enabled = true) {
  const {setHidden} = useSidebarVisibility();
  useEffect(() => {
    if (!enabled) return;
    setHidden(true);
    return () => setHidden(false);
  }, [enabled, setHidden]);
}
