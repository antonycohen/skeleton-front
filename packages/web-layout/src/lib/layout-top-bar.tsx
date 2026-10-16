import {Fragment, ReactNode} from 'react';
import {Navbar} from './navbar';

type LayoutTopbarProps = {
  breadcrumbs?: ReactNode;
  buttons?: ReactNode[];
  className?: string;
};

/** The breadcrumb flavour of the {@link Navbar}: toggle + breadcrumb, actions on the right. */
export function LayoutTopbar({ breadcrumbs, buttons, className }: LayoutTopbarProps) {
  return (
    <Navbar
      className={className}
      left={breadcrumbs}
      right={
        buttons && buttons.length > 0
          ? buttons.map((button, index) => <Fragment key={index}>{button}</Fragment>)
          : undefined
      }
    />
  );
}
