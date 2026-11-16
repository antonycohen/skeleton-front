import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from '@skeleton/core-utils';

// Three columns: icon (28px = 16px icon + 12px gap, 0 without one), content, action (auto, empty
// without one). No row gap, so the action spanning both rows adds no height to a title-only
// alert. rounded-xl, one step under the rounded-2xl Card and Dialog it usually sits in.
// A container (@container/alert): its action follows its width, beside the text or under it.
const alertVariants = cva(
  "@container/alert relative w-full rounded-xl border p-4 body grid grid-cols-[0_1fr_auto] has-[>svg]:grid-cols-[calc(var(--spacing)*7)_1fr_auto] [&>[data-slot=alert-title]+[data-slot=alert-description]]:mt-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      // Toned variants use the status tokens of web-themes (surface, border, on-surface), shared
      // with any component carrying the same meaning. Title, icon and description share the
      // on-surface colour; only default sets the description apart (muted-foreground).
      //
      // The colour says how much it matters, the icon what kind of message it is:
      // - default      InfoIcon          context, nothing to do
      // - important    InfoIcon          not to be missed but no risk: a prerequisite, an upsell,
      //                                  something ready to review
      // - success      CircleCheckIcon   an action went through
      // - warning      TriangleAlertIcon a consequence to read before acting: irreversible, shown
      //                                  once, access lost
      // - destructive  CircleAlertIcon   something failed or is blocked
      variant: {
        // Same border as the content cards.
        default: "border-border-subtle bg-card text-card-foreground",
        important:
          "border-important-border bg-important-surface text-important-on-surface *:data-[slot=alert-description]:text-current",
        success:
          "border-success-border bg-success-surface text-success-on-surface *:data-[slot=alert-description]:text-current",
        warning:
          "border-warning-border bg-warning-surface text-warning-on-surface *:data-[slot=alert-description]:text-current",
        destructive:
          "border-destructive-border bg-destructive-surface text-destructive-on-surface *:data-[slot=alert-description]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      data-variant={variant ?? "default"}
      // Only errors interrupt a screen reader; every other tone is announced politely.
      role={variant === "destructive" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 min-h-4 title",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 body",
        className
      )}
      {...props}
    />
  )
}

/**
 * Buttons or links on the right, centred on the title and description. Use `size="sm"` buttons:
 * the negative margin fits their 32px in the 20px title line, so a title-only alert keeps its height.
 * In a narrow alert (under 28rem: a popover, a side panel) they go under the text, from its left,
 * so the text keeps its width, as Vercel's and incident.io's alerts do in their narrow panels.
 */
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "col-start-3 row-span-2 row-start-1 -my-1.5 ml-4 flex items-center gap-2 self-center text-foreground",
        "@max-md/alert:col-start-2 @max-md/alert:row-span-1 @max-md/alert:row-start-3 @max-md/alert:mt-3 @max-md/alert:mb-0 @max-md/alert:ml-0 @max-md/alert:self-start",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
