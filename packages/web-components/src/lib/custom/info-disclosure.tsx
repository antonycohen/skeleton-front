import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

/**
 * Secondary information folded under a question ("What changes in my workspace?"): a card on the plain
 * card surface, closed by default, so the content around it stays short. For what helps or reassures;
 * a warning the person must see stays an open `Alert`.
 *
 * The trigger carries the card's padding: closed, a click anywhere on the card opens it; open, its
 * header row closes it.
 */
export function InfoDisclosure(props: { icon: ReactNode; title: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <Collapsible defaultOpen={props.defaultOpen} className="rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-subtle bg-card">
      <CollapsibleTrigger className="group flex w-full cursor-pointer items-center gap-2 rounded-2xl p-4 text-left body text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground">
        {props.icon}
        {props.title}
        <ChevronDown className="ml-auto transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      {/* Lined up with the title (16px padding, 16px icon, 8px gap), 12px under it. */}
      <CollapsibleContent className="pr-4 pb-4 pl-10 body text-muted-foreground">
        <div className="-mt-1">{props.children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
