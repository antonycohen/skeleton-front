import { useState, useCallback, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '../ui/carousel';

export type CarouselModalSlide = {
  image: string;
  title: string;
  description: string;
};

export type CarouselModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slides: CarouselModalSlide[];
  lastSlideButtonLabel?: string;
  nextButtonLabel?: string;
  onComplete?: () => void;
};

export function CarouselModal({
  open,
  onOpenChange,
  slides,
  lastSlideButtonLabel: lastSlideButtonLabelProp,
  nextButtonLabel: nextButtonLabelProp,
  onComplete,
}: CarouselModalProps) {
  const { t } = useTranslation();
  const lastSlideButtonLabel = lastSlideButtonLabelProp ?? t('components.carouselModal.finish');
  const nextButtonLabel = nextButtonLabelProp ?? t('components.carouselModal.next');
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isLastSlide = current === slides.length - 1;

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
      setIsTransitioning(false);
    };

    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // Reset to first slide when modal opens
  useEffect(() => {
    if (open && api) {
      api.scrollTo(0, true);
    }
  }, [open, api]);

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      onOpenChange(false);
      onComplete?.();
      return;
    }
    setIsTransitioning(true);
    api?.scrollNext();
  }, [api, isLastSlide, onOpenChange, onComplete]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[448px] overflow-clip rounded-3xl border p-0 gap-0 shadow-lg"
      >
        {/* Close button */}
        <DialogClose className="absolute right-[15px] top-[15px] z-10 flex size-8 items-center justify-center rounded-md border bg-background shadow-xs transition-opacity hover:opacity-80">
          <XIcon className="size-4" />
          <span className="sr-only">{t('common.close')}</span>
        </DialogClose>

        {/* Carousel cover + indicators */}
        <div className="flex flex-col gap-4 items-start pt-2 px-2">
          <Carousel
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent>
              {slides.map((slide, index) => (
                <CarouselItem key={index}>
                  <div className="overflow-clip rounded-2xl border">
                    <div className="aspect-[3/2] w-full">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="size-full object-cover"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Pagination dots */}
          <div className="flex w-full items-center justify-center gap-2">
            {slides.map((_, index) => (
              <span
                key={index}
                className={cn(
                  'size-2 rounded-full transition-colors',
                  index === current ? 'bg-primary' : 'bg-border'
                )}
              />
            ))}
          </div>
        </div>

        {/* Text content with fade transition */}
        <div className="px-8 pt-8 text-center">
          <div
            className={cn(
              'flex flex-col gap-3 transition-opacity duration-300',
              isTransitioning ? 'opacity-0' : 'opacity-100'
            )}
          >
            <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
              {slides[current]?.title}
            </DialogTitle>
            <p className="text-base text-muted-foreground">
              {slides[current]?.description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-6">
          <Button size="lg" className="w-full" onClick={handleNext}>
            {isLastSlide ? lastSlideButtonLabel : nextButtonLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
