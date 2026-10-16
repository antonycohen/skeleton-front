import { type ReactNode } from 'react';

interface ErrorPlaceholderProps {
  image: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const ErrorPlaceholder = ({
  image,
  title,
  description,
  actions,
}: ErrorPlaceholderProps) => {
  return (
    <div className="flex size-full flex-col items-center justify-center bg-muted h-full">
      <div className="flex w-full max-w-[672px] flex-col items-center gap-6">
        <div className="flex w-full flex-col items-center gap-4">
          {image}
          <h2 className="w-full text-center font-heading text-3xl font-semibold tracking-tight text-card-foreground">
            {title}
          </h2>
          <p className="w-full text-center text-sm text-foreground">
            {description}
          </p>
        </div>
        <div className="flex items-start justify-center gap-2">{actions}</div>
      </div>
    </div>
  );
};
