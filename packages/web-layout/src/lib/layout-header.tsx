import { ReactNode } from 'react';

type LayoutHeaderProps = {
  pageTitle: string;
  pageDescription?: string;
  actions?: ReactNode;
};

export function LayoutHeader(props: LayoutHeaderProps) {
  const { pageTitle, pageDescription, actions } = props;

  return (
    <div className="flex flex-col">
      {/* Main content */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col">
          <h1 className="justify-start font-heading text-foreground text-3xl font-semibold leading-9">
            {pageTitle}
          </h1>
          {pageDescription && (
            <p className="text-sm leading-normal font-normal text-muted-foreground">
              {pageDescription}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Actions */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
