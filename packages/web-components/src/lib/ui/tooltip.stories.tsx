import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Download, InfoIcon, Maximize, MousePointer, Type } from 'lucide-react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

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

/** A shortcut after the label, in the lib's kbd chip. */
export const Shortcut: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 200 } } },
  render: (args) => (
    <Tooltip {...args} defaultOpen>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Full screen"><Maximize /></Button>
      </TooltipTrigger>
      <TooltipContent shortcut={['⇧', 'F']}>Full screen</TooltipContent>
    </Tooltip>
  ),
};

/** A disabled action's reason: wraps at `max-w-xs`, balanced. */
export const LongReason: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 200 } } },
  render: (args) => (
    <Tooltip {...args} defaultOpen>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button disabled><Download />Export</Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>Complete the setup first to export this report</TooltipContent>
    </Tooltip>
  ),
};

/**
 * One provider for a row: 400ms before the first tooltip, then none while moving to the next one —
 * hover from button to button.
 */
export const Toolbar: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex items-center gap-1 rounded-lg outline outline-1 outline-offset-[-1px] outline-border-subtle bg-card p-1">
        {[
          { icon: MousePointer, label: 'Select', shortcut: ['V'] },
          { icon: Type, label: 'Text', shortcut: ['T'] },
          { icon: Maximize, label: 'Full screen', shortcut: ['⇧', 'F'] },
          { icon: Download, label: 'Export' },
        ].map(({ icon: Icon, label, shortcut }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={label}><Icon /></Button>
            </TooltipTrigger>
            <TooltipContent shortcut={shortcut}>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
};
