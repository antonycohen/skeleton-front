import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cn } from '@skeleton/core-utils';


function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  // Handed to the root too, so assistive tech reads it (aria-valuenow); clamped because Radix
  // rejects a value outside 0–100 with a console error, and some callers do not clamp theirs.
  const percent = value == null || Number.isNaN(value) ? null : Math.min(100, Math.max(0, value))

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      value={percent}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (percent ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
