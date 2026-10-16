import {DetailedHTMLProps, HTMLAttributes} from 'react';
import {cn} from "@skeleton/core-utils";

export function LayoutContent(props:  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  return <div className={cn(
    "container flex self-stretch px-8 py-12 flex-col justify-start gap-12",
    props.className
  )
  }>{props.children}</div>;
}
