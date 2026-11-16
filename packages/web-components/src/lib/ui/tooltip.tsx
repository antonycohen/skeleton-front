"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from '@skeleton/core-utils';

// Set by TooltipProvider, so a Tooltip below one joins it instead of opening its own.
const TooltipProviderContext = React.createContext(false)

// 400ms before the first tooltip, then none while the pointer moves to the next trigger within 300ms
// (Linear, Figma, Primer). One provider per area — SidebarProvider holds the app shell's — so the
// skip carries across its tooltips.
function TooltipProvider({
  delayDuration = 400,
  skipDelayDuration = 300,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipProviderContext.Provider value={true}>
      <TooltipPrimitive.Provider
        data-slot="tooltip-provider"
        delayDuration={delayDuration}
        skipDelayDuration={skipDelayDuration}
        {...props}
      />
    </TooltipProviderContext.Provider>
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const hasProvider = React.useContext(TooltipProviderContext)
  const root = <TooltipPrimitive.Root data-slot="tooltip" {...props} />
  // Outside any provider (a lone story, a portal), it brings its own.
  return hasProvider ? root : <TooltipProvider>{root}</TooltipProvider>
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 6,
  shortcut,
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  arrowClassName: _arrowClassName,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  /** Keys shown after the label in the lib's kbd chip, e.g. `["⇧", "F"]`. */
  shortcut?: string[]
  /** @deprecated The tooltip has no arrow anymore; ignored. */
  arrowClassName?: string
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          // Always dark, the Toaster's family: `dark` switches the theme's variables inside it, so it
          // stands out from the white pages in light mode and sits a step above the background in
          // dark mode. Popover surface, border-subtle, shadow-md, rounded-lg; 12px text. A long label
          // wraps `pretty` (no word alone on its last line), not `balance`: the box keeps the width of
          // the unbalanced text, so balanced lines left an empty band on its right.
          "dark z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) rounded-lg border border-border-subtle bg-popover px-2 py-1 body-sm-dense text-pretty text-popover-foreground shadow-md",
          // A short fade with a 2px slide when it opens after the delay; none when it opens at once
          // while moving between triggers.
          "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:duration-150 data-[side=bottom]:slide-in-from-top-0.5 data-[side=left]:slide-in-from-right-0.5 data-[side=right]:slide-in-from-left-0.5 data-[side=top]:slide-in-from-bottom-0.5",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-100",
          shortcut && "flex items-center gap-2",
          className
        )}
        {...props}
      >
        {children}
        {shortcut && (
          <span data-slot="tooltip-shortcut" className="flex items-center gap-0.5">
            {shortcut.map((key) => (
              <kbd
                key={key}
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-[6px] bg-muted px-1 label-sm text-muted-foreground"
              >
                {key}
              </kbd>
            ))}
          </span>
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
