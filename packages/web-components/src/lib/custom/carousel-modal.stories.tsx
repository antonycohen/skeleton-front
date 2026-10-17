import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Button } from '../ui/button';
import { CarouselModal, type CarouselModalSlide } from './carousel-modal';

const ASSETS: string = import.meta.env.VITE_STATIC_ASSETS_URL;

const slides: CarouselModalSlide[] = [
  {
    image: `${ASSETS}/header-illustration.svg`,
    title: 'Welcome to your workspace',
    description: 'Everything your team needs, in one place.',
  },
  {
    image: `${ASSETS}/workspace-created.svg`,
    title: 'Invite your team',
    description: 'Add your colleagues — Camille, Hugo, Léa… — and organize them into teams.',
  },
  {
    image: `${ASSETS}/error-illustration.svg`,
    title: 'Stay on top of things',
    description: 'Get notified when something needs your attention.',
  },
];

const meta = {
  title: 'Components/Custom/CarouselModal',
  component: CarouselModal,
  args: { open: true, slides, onOpenChange: fn(), onComplete: fn() },
} satisfies Meta<typeof CarouselModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const CustomLabels: Story = {
  args: { nextButtonLabel: 'Continue', lastSlideButtonLabel: 'Create my first project' },
};

/** Closed, with a button that opens it. */
export const Interactive: Story = {
  parameters: { layout: 'centered' },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Show the onboarding</Button>
        <CarouselModal {...args} open={open} onOpenChange={setOpen} />
      </>
    );
  },
};
