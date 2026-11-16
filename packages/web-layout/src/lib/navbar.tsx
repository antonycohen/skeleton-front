import {ReactNode, RefObject, useEffect, useRef, useState} from 'react';
import {SidebarTrigger} from '@skeleton/web-components';
import {cn} from '@skeleton/core-utils';

export type NavbarProps = {
  /** Rendered after the sidebar toggle, inside the left group. */
  left?: ReactNode;
  /** In-flow content between the left and right groups (e.g. the studio tabs). */
  children?: ReactNode;
  /** Absolutely centered overlay (the funnel stepper). Desktop only. */
  center?: ReactNode;
  right?: ReactNode;
  /** The sidebar toggle needs a `SidebarProvider` ancestor. @default true */
  showToggle?: boolean;
  /** Extra classes on the left group (e.g. a fixed width to align with a column below). */
  leftClassName?: string;
  /** Full-width row rendered under the bar on mobile only. */
  mobileSecondRow?: ReactNode;
  className?: string;
};

/** The nearest ancestor that scrolls vertically; none when the page itself does. */
function scrollParent(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(node).overflowY)) return node;
  }
  return null;
}

/** Whether what the bar sits on has scrolled: content then passes under it. */
function useScrolledUnder(ref: RefObject<HTMLElement | null>) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const scroller = scrollParent(element);
    const update = () => setScrolled((scroller ? scroller.scrollTop : window.scrollY) > 0);
    update();
    const target: HTMLElement | Window = scroller ?? window;
    target.addEventListener('scroll', update, { passive: true });
    return () => target.removeEventListener('scroll', update);
  }, [ref]);
  return scrolled;
}

/**
 * The app's single top bar (Figma "Pro Blocks / Navbar / 5.New"): 52px, the
 * sidebar toggle first, then slots. Pages wrap it in their own sticky
 * `<header>`; full-height views render it as the first flex child.
 */
export function Navbar({
  left,
  children,
  center,
  right,
  showToggle = true,
  leftClassName,
  mobileSecondRow,
  className,
}: NavbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scrolled = useScrolledUnder(ref);

  return (
    // Once content scrolls under it: a subtle border, and a fade over the content it crops.
    <div
      ref={ref}
      data-slot="navbar"
      data-scrolled={scrolled || undefined}
      className={cn(
        'relative w-full shrink-0 bg-background',
        className,
      )}
    >
      <div className="relative flex h-13 items-center px-4 md:px-2">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2">
          <div data-slot="navbar-left" className={cn('flex min-w-0 items-center gap-2', leftClassName)}>
            {showToggle && <SidebarTrigger className="size-9 rounded-md" />}
            {left}
          </div>
          {children && <div className="flex min-w-0 flex-1 items-center">{children}</div>}
          {right && (
            <div data-slot="navbar-right" className="flex shrink-0 items-center gap-2">
              {right}
            </div>
          )}
        </div>
        {center && (
          <div
            data-slot="navbar-center"
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex"
          >
            {center}
          </div>
        )}
      </div>
      {mobileSecondRow && <div className="px-4 pb-2 md:hidden">{mobileSecondRow}</div>}
      {/* On the bar's last pixel row, so it keeps its 52px and no content shows between them: the
          line, then the fade. */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-[calc(100%-1px)] h-6 border-t border-border-subtle bg-gradient-to-b from-background to-transparent opacity-0 transition-opacity',
          scrolled && 'opacity-100',
        )}
      />
    </div>
  );
}
