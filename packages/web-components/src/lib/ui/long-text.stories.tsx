import type { Meta, StoryObj } from '@storybook/react-vite';
import { LongText } from './long-text';

const meta = {
  title: 'Components/UI/LongText',
  component: LongText,
  parameters: { layout: 'centered' },
  args: {
    className: 'w-56',
    children: 'Q4 Roadmap — Acme, Globex and Initech shared projects for the North America teams',
  },
} satisfies Meta<typeof LongText>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Truncated; hovering shows the full text in a tooltip (a popover on mobile). */
export const Overflowing: Story = {};

/** Fits: no tooltip. */
export const Short: Story = { args: { children: 'Acme pricing page' } };
