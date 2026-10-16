import {ReactNode} from 'react';
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
  return (
    <div data-slot="navbar" className={cn('bg-background w-full shrink-0', className)}>
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
    </div>
  );
}
