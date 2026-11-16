"use client"

import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { cn } from '@skeleton/core-utils';
import { buttonVariants } from "./button"

// Alert's icons per type, in the status on-surface tones; info and loading stay neutral.
const icons: ToasterProps["icons"] = {
  success: <CircleCheckIcon className="size-4 text-success-on-surface" />,
  info: <InfoIcon className="size-4 text-muted-foreground" />,
  warning: <TriangleAlertIcon className="size-4 text-warning-on-surface" />,
  error: <CircleAlertIcon className="size-4 text-destructive-on-surface" />,
  loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
}

// Sonner's own styles are dropped (`unstyled`): each part takes the theme's classes, Alert's
// anatomy on an overlay surface.
const classNames: NonNullable<ToasterProps["toastOptions"]>["classNames"] = {
  toast: cn(
    // Always dark: `dark` on the toast switches the theme's variables inside it, so it stands out
    // from the white pages in light mode and sits a step above the background in dark mode.
    // Popover surface, border-subtle like the content cards, rounded-xl like Alert, shadow-lg
    // (md's two tight layers bunch up under the border). `body`: the toaster sets the system font
    // at 16px, so any text without a style of its own falls back on the theme's.
    "dark flex w-(--width) items-start gap-3 rounded-xl border border-border-subtle bg-popover p-4 body text-popover-foreground shadow-lg",
    // Opening: a reflection of the status color passes once along the border, a diagonal band at
    // 20% between two transparent ends; the border stays border-subtle before and after. The
    // pseudo-element sits on the 1px border, the mask keeps only the ring. Keyframes: web-themes
    // custom.css. Each type starts its own pass, so a promise toast gets one when it settles.
    "before:pointer-events-none before:absolute before:-inset-px before:rounded-[inherit] before:p-px before:opacity-0",
    "before:[background:linear-gradient(135deg,transparent_0_44%,color-mix(in_oklab,var(--toast-tone)_20%,transparent)_50%,transparent_56%_100%)_100%_0/300%_100%]",
    "before:[mask-image:linear-gradient(#000_0_0),linear-gradient(#000_0_0)] before:[mask-clip:content-box,border-box] before:[mask-composite:exclude]",
    "data-[type=success]:[--toast-tone:var(--base-success-on-surface)] data-[type=error]:[--toast-tone:var(--base-destructive-on-surface)] data-[type=warning]:[--toast-tone:var(--base-warning-on-surface)]",
    "data-[type=success]:data-[mounted=true]:before:animate-[border-sheen_2.6s_ease-in-out_0.3s_both]",
    "data-[type=error]:data-[mounted=true]:before:animate-[border-sheen_2.6s_ease-in-out_0.3s_both]",
    "data-[type=warning]:data-[mounted=true]:before:animate-[border-sheen_2.6s_ease-in-out_0.3s_both]",
    "motion-reduce:before:hidden"
  ),
  icon: "flex size-4 shrink-0 translate-y-0.5 items-center",
  content: "flex min-w-0 flex-1 flex-col gap-0.5",
  title: "title",
  // `!`: sonner's dark theme forces its own gray on the description, outside Tailwind's layers.
  description: "body text-muted-foreground!",
  // Same offset as AlertAction: the 32px button fits a title-only toast's line.
  actionButton: cn(buttonVariants({ variant: "outline", size: "sm" }), "-my-1.5 self-center"),
  cancelButton: cn(buttonVariants({ variant: "ghost", size: "sm" }), "-my-1.5 self-center"),
}

const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      icons={icons}
      {...props}
      toastOptions={{
        unstyled: true,
        ...toastOptions,
        classNames: { ...classNames, ...toastOptions?.classNames },
      }}
    />
  )
}

export { Toaster }
