import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { InfoIcon } from 'lucide-react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const SIDES = ['top', 'right', 'bottom', 'left'] as const;

const meta = {
  title: 'Components/UI/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  args: { onOpenChange: fn() },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" aria-label="About seats"><InfoIcon /></Button>
      </TooltipTrigger>
      <TooltipContent>Each member of the workspace uses one seat</TooltipContent>
    </Tooltip>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, iframeHeight: 200 } } },
};

/** Every side. */
export const Sides: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 260 } } },
  render: (args) => (
    <div className="grid grid-cols-2 gap-x-32 gap-y-16 p-16">
      {SIDES.map((side) => (
        <Tooltip key={side} {...args} defaultOpen>
          <TooltipTrigger asChild>
            <Button variant="outline">{side}</Button>
          </TooltipTrigger>
          <TooltipContent side={side}>Tooltip on the {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};
