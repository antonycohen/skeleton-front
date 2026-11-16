import * as React from 'react';
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import { cn } from '@skeleton/core-utils';

/**
 * A scrolling area whose scrollbar is drawn over the content: no gutter taken from the layout, a
 * thin 6px thumb shown while the pointer is over the area or it scrolls (`type="hover"`, Linear,
 * Notion). Pass `type="auto"` or `"always"` to keep it in sight.
 *
 * `className` styles the frame (size, mask, borders); `viewportClassName` the scrolling content's
 * box (paddings). `viewportRef` reaches the element that scrolls, for scroll listeners.
 */
function ScrollArea({
  className,
  viewportClassName,
  viewportRef,
  type = 'hover',
  scrollHideDelay = 400,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  viewportClassName?: string;
  viewportRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      type={type}
      scrollHideDelay={scrollHideDelay}
      // A column, the viewport its flex child: it takes the frame's height even when that comes
      // from a `max-h` (a `h-full` viewport would not resolve against it).
      className={cn('relative flex flex-col overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className={cn(
          'focus-visible:ring-ring/50 min-h-0 w-full flex-1 overscroll-contain rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1',
          // Radix wraps the content in a `display: table` box, which lets wide content (long tags,
          // truncated labels) stretch past the width: a plain block keeps it to the area's width.
          // Content wider on purpose (`w-max`, `whitespace-nowrap`) still overflows and scrolls.
          '[&>div]:!block',
          viewportClassName,
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'flex touch-none p-px transition-opacity duration-150 select-none data-[state=hidden]:opacity-0',
        orientation === 'vertical' && 'h-full w-2',
        orientation === 'horizontal' && 'h-2 flex-col',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-muted-foreground/45 relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
