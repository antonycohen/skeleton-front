import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ArrowRightIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import { Button } from './button';

const VARIANTS = ['default', 'accent', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
const SIZES = ['sm', 'default', 'lg', 'icon'] as const;

const meta = {
  title: 'Components/UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  args: { children: 'Button', onClick: fn() },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: SIZES },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    asChild: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Accent: Story = { args: { variant: 'accent' } };

export const Outline: Story = { args: { variant: 'outline' } };

export const Destructive: Story = {
  args: { variant: 'destructive', children: <><Trash2Icon /> Delete</> },
};

export const WithIcon: Story = {
  args: { children: <>Continue <ArrowRightIcon /></> },
};

export const Icon: Story = {
  args: { size: 'icon', variant: 'outline', children: <PlusIcon />, 'aria-label': 'Add' },
};

/** Ghost, icon only (close, sidebar toggle, "…"). */
export const GhostIcon: Story = {
  name: 'Ghost — Icon',
  args: { size: 'icon', variant: 'ghost', children: <XIcon />, 'aria-label': 'Close' },
};

export const Loading: Story = { args: { isLoading: true, children: 'Saving' } };

export const Disabled: Story = { args: { disabled: true } };

/** Every variant at every size. */
export const Matrix: Story = {
  render: (args) => (
    <div className="grid grid-cols-[auto_repeat(4,auto)] items-center gap-3">
      <span />
      {SIZES.map((size) => (
        <span key={size} className="text-xs text-muted-foreground">{size}</span>
      ))}
      {VARIANTS.map((variant) => (
        <div key={variant} className="contents">
          <span className="text-xs text-muted-foreground">{variant}</span>
          {SIZES.map((size) => (
            <Button key={size} {...args} variant={variant} size={size}>
              {size === 'icon' ? <PlusIcon /> : 'Button'}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};
