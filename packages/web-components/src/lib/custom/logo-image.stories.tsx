import type { Meta, StoryObj } from '@storybook/react-vite';
import { LogoImage } from './logo-image';

const meta = {
  title: 'Components/Custom/LogoImage',
  component: LogoImage,
  parameters: { layout: 'centered' },
  args: { src: '/logo-icon.svg', alt: 'Logo', className: 'h-16' },
  argTypes: { fillColor: { control: 'color' } },
} satisfies Meta<typeof LogoImage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Untouched image. */
export const Default: Story = {};

/** Recolored into a flat silhouette (near-white pixels count as background). */
export const Filled: Story = { args: { fillColor: '#6366F1' } };

/** A white silhouette, as on a dark logos banner. */
export const WhiteOnDark: Story = {
  args: { fillColor: '#FFFFFF' },
  decorators: [(Story) => <div className="rounded-lg bg-zinc-900 p-6"><Story /></div>],
};
