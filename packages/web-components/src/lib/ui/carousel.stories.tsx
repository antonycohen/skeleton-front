import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardContent } from './card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel';

const SLIDES = ['Acme — Hero', 'Acme — Pricing', 'Globex — Hero', 'Globex — Case study', 'Initech — Demo'];

const meta = {
  title: 'Components/UI/Carousel',
  component: Carousel,
  parameters: { layout: 'centered' },
  argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } },
  render: (args) => (
    <Carousel {...args} className="w-full max-w-xs">
      <CarouselContent>
        {SLIDES.map((slide) => (
          <CarouselItem key={slide}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6 text-lg font-semibold">
                {slide}
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loop: Story = { args: { opts: { loop: true } } };

/** Several slides per view. */
export const MultipleItems: Story = {
  render: (args) => (
    <Carousel {...args} opts={{ align: 'start' }} className="w-full max-w-lg">
      <CarouselContent className="-ml-2">
        {SLIDES.map((slide) => (
          <CarouselItem key={slide} className="basis-1/3 pl-2">
            <Card className="py-0">
              <CardContent className="flex aspect-[3/4] items-center justify-center p-4 text-center text-sm font-medium">
                {slide}
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical', opts: { align: 'start' } },
  render: (args) => (
    <div className="py-12">
      <Carousel {...args} className="w-full max-w-xs">
        <CarouselContent className="-mt-2 h-60">
          {SLIDES.map((slide) => (
            <CarouselItem key={slide} className="basis-1/2 pt-2">
              <Card className="py-0">
                <CardContent className="flex h-full items-center justify-center p-6 font-semibold">{slide}</CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};
