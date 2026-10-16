import { ReactNode } from 'react';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export type ActionMenuItemProps = {
  children: ReactNode;
  onSelect: () => void;
  /** When set, the item renders disabled and this text explains why (tooltip). */
  blockedReason?: string | null;
  className?: string;
};

/**
 * A dropdown menu item that is either enabled (selectable) or disabled with a
 * tooltip explaining why. A disabled Radix item is `pointer-events-none`, so
 * the hover is caught by the wrapping span instead.
 */
export function ActionMenuItem({ children, onSelect, blockedReason, className }: ActionMenuItemProps) {
  if (!blockedReason) {
    return (
      <DropdownMenuItem onSelect={onSelect} className={className}>
        {children}
      </DropdownMenuItem>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-not-allowed">
          <DropdownMenuItem disabled onSelect={onSelect} className={className}>
            {children}
          </DropdownMenuItem>
        </span>
      </TooltipTrigger>
      <TooltipContent>{blockedReason}</TooltipContent>
    </Tooltip>
  );
}
