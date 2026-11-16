import { ReactNode } from 'react';

type LayoutHeaderProps = {
  pageTitle: string;
  /** Shown inline after the title, e.g. a status badge. */
  titleAddon?: ReactNode;
  pageDescription?: string;
  /** What the page is about, beside its title (a product's logo): on a 36px tile, its glyph 20px. */
  icon?: ReactNode;
  actions?: ReactNode;
};

export function LayoutHeader(props: LayoutHeaderProps) {
  const { pageTitle, titleAddon, pageDescription, icon, actions } = props;

  return (
    <div className="flex flex-col">
      {/* Main content */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        {/* Title and description 4px apart, as every title over its description. */}
        <div className="flex flex-col gap-1">
          {/* The icon at the title's height, 12px from it; the description under both, from the icon's edge. */}
          <div className="flex items-center gap-3">
            {icon && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-input bg-background shadow-xs [&_svg]:size-5">
                {icon}
              </span>
            )}
            <h1 className="heading-lg text-foreground">
              {pageTitle}
              {titleAddon && <span className="ml-3 inline-flex align-middle">{titleAddon}</span>}
            </h1>
          </div>
          {pageDescription && (
            <p className="body text-muted-foreground">
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
