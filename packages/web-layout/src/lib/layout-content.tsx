import {type DetailedHTMLProps, type HTMLAttributes} from 'react';
import {cn} from "@skeleton/core-utils";

/**
 * Page widths:
 * - `page`: every main page (dashboard, lists, a detail page) — fluid between 32px gutters,
 *   1440px at most, centered, so the content never jumps from one page to the next.
 * - `narrow`: settings and forms, a section of their own — 720px at most, centered.
 */
export type LayoutContentWidth = 'page' | 'narrow';

const widths: Record<LayoutContentWidth, string> = {
  page: 'max-w-8xl',
  narrow: 'max-w-[720px]',
};

/**
 * A page's content: 32px gutters, 32px above and 48px below, 48px between sections, centered at the
 * page's width. `className` styles the column (its gap); the page header goes inside, in the same column,
 * 32px above what it introduces (its table, its first section): the first child holding the page's h1
 * takes back 16px of the default gap. A tighter gap set through `className` drops `gap-12`, and the rule
 * with it.
 */
export function LayoutContent({
  width = 'page',
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {width?: LayoutContentWidth}) {
  return (
    // A minmax(0, 1fr) grid: wide content (a table) never widens the page, it scrolls in its own box.
    <div className="grid w-full min-w-0 self-stretch grid-cols-[minmax(0,1fr)] px-8 pt-8 pb-12">
      <div
        {...props}
        className={cn(
          'mx-auto flex w-full min-w-0 flex-col justify-start gap-12 [&.gap-12>:first-child:has(h1)]:-mb-4',
          widths[width],
          className
        )}
      />
    </div>
  );
}
