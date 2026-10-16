import { X } from 'lucide-react';
import { cn } from '@skeleton/core-utils';
import { Button } from '../ui/button';

export type TooltipBannerProps = {
  className?: string;
  children: React.ReactNode;
  characterSrc?: string;
  onDismiss?: () => void;
};

export function TooltipBanner({
  className,
  children,
  characterSrc,
  onDismiss,
}: TooltipBannerProps) {
  return (
    <div
      data-slot="tooltip-banner"
      className={cn(
        'relative flex min-w-2xl items-center gap-4 rounded-2xl border border-white/10 bg-primary pl-6 pr-64 py-6 shadow-2xl',
        'bg-[image:repeating-linear-gradient(0deg,transparent,transparent_7.5px,#4338CA_7.5px,#4338CA_8px),repeating-linear-gradient(90deg,transparent,transparent_7.5px,#4338CA_7.5px,#4338CA_8px)]',
        className
      )}
    >
      <p className="flex-1 font-heading text-lg font-semibold leading-[26px] tracking-[-0.15px] text-primary-foreground">
        {children}
      </p>

      {characterSrc && (
        <img
          src={characterSrc}
          alt=""
          className="pointer-events-none absolute -bottom-px right-[23px] h-36 w-[216px] object-contain object-bottom"
        />
      )}

      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-[15px] top-[15px] size-9 cursor-pointer text-primary-foreground/70 hover:bg-transparent hover:text-primary-foreground"
          onClick={onDismiss}
        >
          <X className="size-4 opacity-70" />
        </Button>
      )}
    </div>
  );
}
