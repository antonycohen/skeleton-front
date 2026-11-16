import { ReactNode } from 'react';
import { cn } from '@skeleton/core-utils';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export type ActionMenuItemProps = {
  children: ReactNode;
  onSelect: () => void;
  /** When set, the item renders disabled and this text explains why (tooltip). */
  blockedReason?: string | null;
  /** `destructive` reds the text and the icon, while the action can be taken. */
  variant?: 'default' | 'destructive';
  className?: string;
};

/**
 * A dropdown menu item that is either enabled (selectable) or disabled with a
 * tooltip explaining why — then neutral, even for a destructive action. A
 * disabled Radix item is `pointer-events-none`, so the hover is caught by the
 * wrapping span instead.
 */
export function ActionMenuItem({ children, onSelect, blockedReason, variant = 'default', className }: ActionMenuItemProps) {
  if (!blockedReason) {
    return (
      <DropdownMenuItem onSelect={onSelect} variant={variant} className={className}>
        {children}
      </DropdownMenuItem>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-not-allowed">
          {/* Greyed like any unavailable item: no red on an action that can't be taken. */}
          <DropdownMenuItem disabled onSelect={onSelect} className={cn(className, 'text-foreground focus:text-foreground')}>
            {children}
          </DropdownMenuItem>
        </span>
      </TooltipTrigger>
      <TooltipContent>{blockedReason}</TooltipContent>
    </Tooltip>
  );
}
