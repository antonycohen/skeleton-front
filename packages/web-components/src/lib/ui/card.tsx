import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@skeleton/core-utils';

/**
 * A content card (a section, a metric, a chart, a list): the card surface, a `border-subtle`
 * outline, 16px corners and no shadow — content sits on the page, it doesn't lift off it. Shadows
 * are for what floats (popovers, menus, dialogs).
 */
const cardVariants = cva(
  'bg-card text-card-foreground flex flex-col gap-6 rounded-2xl py-6 outline outline-1 outline-offset-[-1px] outline-border-subtle',
);

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants(), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-x-2 gap-y-1 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A card's title: `title` (14/20 semibold) for cards of data — metrics, charts, lists. `size="lg"`
 * (`title-lg`, 18/26) for a card that is a section of its page: the settings' cards.
 */
function CardTitle({ className, size = 'default', ...props }: React.ComponentProps<'div'> & { size?: 'default' | 'lg' }) {
  return (
    <div
      data-slot="card-title"
      className={cn(size === 'lg' ? 'title-lg' : 'title', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground body', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
}

export {
  Card,
  cardVariants,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
