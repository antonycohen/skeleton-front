import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Slider } from './slider';

const meta = {
  title: 'Components/UI/Slider',
  component: Slider,
  parameters: { layout: 'centered' },
  args: { defaultValue: [50], max: 100, step: 1, className: 'w-72', onValueChange: fn() },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Range: Story = { args: { defaultValue: [20, 80] } };

export const Vertical: Story = { args: { orientation: 'vertical', className: undefined } };

export const Disabled: Story = { args: { disabled: true } };
