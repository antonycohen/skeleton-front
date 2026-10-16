import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from '@skeleton/core-utils';
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-border-subtle bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-border-subtle bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-rose-100 bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 dark:border-transparent",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success:
          "border-teal-100 bg-teal-50 text-teal-600 [a&]:hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-400",
        warning:
          "border-amber-100 bg-amber-50 text-amber-600 [a&]:hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
        important:
          "border-indigo-100 bg-indigo-50 text-indigo-600 [a&]:hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
function Badge({
                 className,
                 variant,
                 asChild = false,
                 ...props
               }: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}
export { Badge, badgeVariants }
