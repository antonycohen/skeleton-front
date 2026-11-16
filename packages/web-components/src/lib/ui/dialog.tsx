"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { ScrollArea } from './scroll-area';
import { buttonVariants } from './button';


function Dialog({
                  ...props
                }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
                         ...props
                       }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
                        ...props
                      }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
                       ...props
                     }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
                         className,
                         ...props
                       }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

/**
 * The dialog of every modal: header, body, footer (DialogHeader, DialogBody, DialogFooter, and
 * DialogMedia for an image on top). The header and the footer stay put, only the body scrolls; its
 * rules show only when there is something under them. 16px corners, 24px on the sides, at the edges
 * and between the parts. Its height is the content's own, capped at 85% of the viewport and 800px.
 *
 * `size`: `sm` (440px) for a confirmation or a success, `md` (560px, the default) for a form or a
 * choice, `lg` (740px) for an import, a flow or a paywall.
 *
 * `fixedHeight`, for the steps of one flow: every step the same height (704px, or 85% of a shorter
 * viewport), so the dialog doesn't jump and the actions stay in place.
 *
 * `scrollable={false}` keeps a free layout, for a surface that draws its own (the command palette,
 * a carousel, a game): no parts, no paddings.
 */
const dialogSizes = {
  sm: "sm:max-w-[440px]",
  md: "sm:max-w-[560px]",
  lg: "sm:max-w-[740px]",
} as const

function DialogContent({
                         className,
                         children,
                         showCloseButton = true,
                         scrollable = true,
                         fixedHeight = false,
                         size = "md",
                         ...props
                       }: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  scrollable?: boolean
  fixedHeight?: boolean
  size?: keyof typeof dialogSizes
}) {
  const { t } = useTranslation()

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-scrollable={scrollable || undefined}
        className={cn(
          "group/dialog bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg",
          scrollable &&
            "flex max-h-[min(85dvh,800px)] flex-col gap-0 overflow-hidden rounded-2xl p-0",
          scrollable && dialogSizes[size],
          scrollable && fixedHeight && "h-[min(85dvh,704px)]",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          // The same close button as the side panels': a ghost icon Button, centered on the title's line.
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "absolute top-4 right-4")}
          >
            {/* 20px: Lucide's cross only fills the middle half of its box, 16px reads too small by a title. */}
            <XIcon className="size-5" />
            <span className="sr-only">{t('common.close')}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/**
 * An image across the top of a dialog — a success or an upsell: 8px from the dialog's edges, its
 * corners following the dialog's. Put it before the DialogHeader; the image fills its width.
 */
function DialogMedia({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="dialog-media" className={cn("shrink-0 px-2 pt-2", className)} {...props}>
      <div className="overflow-hidden rounded-md [&>img]:block [&>img]:w-full">{children}</div>
    </div>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        // Scrollable dialog: fixed at the top, clear of the close button.
        "group-data-[scrollable]/dialog:shrink-0 group-data-[scrollable]/dialog:px-6 group-data-[scrollable]/dialog:pt-6 group-data-[scrollable]/dialog:pr-16 group-data-[scrollable]/dialog:pb-5",
        // Under a DialogMedia the close button sits on the image: even sides, so centered text is centered.
        "[[data-slot=dialog-media]+&]:pr-6",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        // Scrollable dialog: fixed at the bottom, always in sight.
        "group-data-[scrollable]/dialog:shrink-0 group-data-[scrollable]/dialog:px-6 group-data-[scrollable]/dialog:pt-5 group-data-[scrollable]/dialog:pb-6",
        // No body between the header and the footer: 24px between them, like every other gap.
        "group-data-[scrollable]/dialog:[[data-slot=dialog-header]+&]:pt-1",
        className
      )}
      {...props}
    />
  )
}

/**
 * The part of a `scrollable` dialog that scrolls. Its top rule appears once it has scrolled, its
 * bottom rule while content remains below; both are always there, transparent, so nothing shifts
 * when they show. The scrollbar is drawn over the content, shown on hover.
 */
function DialogBody({ className, children }: { className?: string; children: React.ReactNode }) {
  const scroller = React.useRef<HTMLDivElement>(null)
  const content = React.useRef<HTMLDivElement>(null)
  const [edges, setEdges] = React.useState({ above: false, below: false })

  React.useLayoutEffect(() => {
    const element = scroller.current
    if (!element) return
    const update = () =>
      setEdges({
        above: element.scrollTop > 0,
        below: element.scrollTop + element.clientHeight < element.scrollHeight - 1,
      })
    update()
    element.addEventListener("scroll", update, { passive: true })
    // The viewport (the body's height) or the content (a section unfolding) can change the overflow.
    // Absent from jsdom: the tests render every dialog through this body.
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update)
    observer?.observe(element)
    if (content.current) observer?.observe(content.current)
    return () => {
      element.removeEventListener("scroll", update)
      observer?.disconnect()
    }
  }, [])

  return (
    <ScrollArea
      viewportRef={scroller}
      className={cn(
        "min-h-0 flex-1 border-y border-transparent transition-colors duration-150",
        // No footer after it (choice dialogs, where the cards are the actions): it keeps the 24px edge.
        "[&:not(:has(~[data-slot=dialog-footer]))]:pb-5",
        edges.above && "border-t-border-subtle",
        edges.below && "border-b-border-subtle"
      )}
    >
      {/* 4px around so focus rings near the edges aren't clipped by the scroll. */}
      <div
        ref={content}
        data-slot="dialog-body"
        data-scrolled={edges.above || undefined}
        data-more-below={edges.below || undefined}
        className={cn("px-6 py-1", className)}
      >
        {children}
      </div>
    </ScrollArea>
  )
}

function DialogTitle({
                       className,
                       ...props
                     }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("title-lg-dense", className)}
      {...props}
    />
  )
}

function DialogDescription({
                             className,
                             ...props
                           }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground body", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
